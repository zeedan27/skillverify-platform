import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import {
  GenerateQuizAiDto,
  GeneratedQuizResponse,
  QuizQuestion,
  TokenPayload,
  Role,
} from '@skillverify/shared';

@Injectable()
export class QuizGeneratorService {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private readonly ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async generateQuestions(
    user: TokenPayload,
    dto: GenerateQuizAiDto,
  ): Promise<GeneratedQuizResponse> {
    const job = await this.jobModel.findById(dto.jobId).exec();
    if (!job) {
      throw new NotFoundException(`Job circular #${dto.jobId} not found`);
    }

    if (job.employerId.toString() !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only the employer who posted this circular can generate questions',
      );
    }

    const count = Math.min(Math.max(dto.count || 10, 10), 20); // 10 to 20 questions
    const multiRatio = dto.multiRatio !== undefined ? dto.multiRatio : 0.2; // default 20%

    // 1. Try Primary: gemma4:31b-cloud (Remote execution, CPU-safe for laptops)
    try {
      this.logger.log(`Attempting quiz generation via primary engine: gemma4:31b-cloud (${count} questions)`);
      const gemmaQuestions = await this.generateWithOllama(
        'gemma4:31b-cloud',
        job.title,
        job.requiredSkills,
        count,
        multiRatio,
        dto.difficultyMix,
        35000,
      );

      if (gemmaQuestions && gemmaQuestions.length >= 10) {
        return {
          questions: gemmaQuestions.slice(0, count),
          source: 'gemma4-cloud',
          warnings: [
            'RULE-024: AI-generated questions are saved as unattached drafts. Review answer keys and explanations before attaching to circular.',
          ],
        };
      }
    } catch (err: any) {
      this.logger.warn(`Primary model (gemma4:31b-cloud) failed or timed out: ${err.message}. Trying local fallback.`);
    }

    // 2. Try Fallback: llama3:latest with micro-chunking (CPU-safe)
    try {
      this.logger.log('Attempting quiz generation via fallback engine: llama3:latest (micro-chunked for CPU)');
      const llamaQuestions = await this.generateWithLlamaChunked(
        job.title,
        job.requiredSkills,
        count,
        multiRatio,
      );

      if (llamaQuestions && llamaQuestions.length >= 10) {
        return {
          questions: llamaQuestions.slice(0, count),
          source: 'llama3-local',
          warnings: [
            'Generated using local llama3:latest CPU fallback.',
            'RULE-024: AI-generated questions are saved as unattached drafts. Review answer keys and explanations before attaching to circular.',
          ],
        };
      }
    } catch (err: any) {
      this.logger.warn(`Fallback model (llama3:latest) failed: ${err.message}. Engaging deterministic generator.`);
    }

    // 3. Fallback: Deterministic Template Generator (Zero failure guarantee)
    const templateQuestions = this.generateDeterministicTemplates(
      job.title,
      job.requiredSkills,
      count,
      multiRatio,
    );

    return {
      questions: templateQuestions,
      source: 'template',
      warnings: [
        'AI engines unreachable or timed out. Domain-curated question templates generated as fallback.',
        'RULE-024: AI-generated questions are saved as unattached drafts. Review answer keys and explanations before attaching to circular.',
      ],
    };
  }

  private async generateWithOllama(
    model: string,
    jobTitle: string,
    skills: string[],
    count: number,
    multiRatio: number,
    difficultyMix?: { easy: number; medium: number; hard: number },
    timeoutMs = 35000,
  ): Promise<Omit<QuizQuestion, '_id'>[] | null> {
    const multiCount = Math.round(count * multiRatio);
    const singleCount = count - multiCount;

    const prompt = `You are a Principal Software Architect and Assessment Creator for SkillVerify.
Create ${count} technically rigorous multiple-choice assessment questions for the role "${jobTitle}".
Skills to test: ${skills.join(', ')}.

Requirements:
- Exactly ${count} questions.
- Exactly 4 options per question.
- ${singleCount} questions must be single-choice (isMultiple: false, correctIndex: 0-3, correctIndices: null).
- ${multiCount} questions must be multi-choice (isMultiple: true, correctIndices: array of numbers like [0, 2], correctIndex: null).
- Include comprehensive 'explanation' for each question.
- Return ONLY valid JSON adhering strictly to this schema:
{
  "questions": [
    {
      "text": "Question statement here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "isMultiple": false,
      "correctIndex": 0,
      "difficulty": "medium",
      "explanation": "Why Option A is correct..."
    }
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3,
            num_predict: 4096,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama returned HTTP ${response.status}`);
      }

      const data: any = await response.json();
      const rawText = data.response;
      if (!rawText) return null;

      const parsed = JSON.parse(rawText);
      const rawQuestions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data;
      if (!Array.isArray(rawQuestions)) return null;

      return this.sanitizeQuestions(rawQuestions);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async generateWithLlamaChunked(
    jobTitle: string,
    skills: string[],
    totalCount: number,
    multiRatio: number,
  ): Promise<Omit<QuizQuestion, '_id'>[]> {
    // Generate in chunks of 3 questions to prevent CPU locking on laptop
    const chunkSize = 3;
    const chunks = Math.ceil(totalCount / chunkSize);
    const collected: Omit<QuizQuestion, '_id'>[] = [];

    for (let i = 0; i < chunks && collected.length < totalCount; i++) {
      const targetInChunk = Math.min(chunkSize, totalCount - collected.length);
      const chunkQuestions = await this.generateWithOllama(
        'llama3:latest',
        jobTitle,
        skills,
        targetInChunk,
        multiRatio,
        undefined,
        25000,
      );

      if (chunkQuestions && chunkQuestions.length > 0) {
        collected.push(...chunkQuestions);
      }
    }

    return collected;
  }

  private sanitizeQuestions(rawQuestions: any[]): Omit<QuizQuestion, '_id'>[] {
    return rawQuestions
      .filter((q) => q && typeof q.text === 'string' && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => {
        // Ensure exactly 4 options
        let options: string[] = q.options.slice(0, 4).map((opt: any) => String(opt).trim());
        while (options.length < 4) {
          options.push(`Alternative option ${options.length + 1}`);
        }

        const isMultiple = !!q.isMultiple;
        let correctIndex: number | undefined = undefined;
        let correctIndices: number[] | undefined = undefined;

        if (isMultiple) {
          if (Array.isArray(q.correctIndices) && q.correctIndices.length > 0) {
            correctIndices = q.correctIndices
              .map((i: any) => Number(i))
              .filter((i: number) => !isNaN(i) && i >= 0 && i < 4);
          }
          if (!correctIndices || correctIndices.length === 0) {
            correctIndices = [0, 1];
          }
        } else {
          correctIndex = typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4
            ? q.correctIndex
            : 0;
        }

        const difficulty = ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium';

        return {
          text: q.text.trim(),
          options,
          isMultiple,
          correctIndex,
          correctIndices,
          difficulty,
          explanation: q.explanation || 'Verified standard industry practice according to technical specifications.',
        };
      });
  }

  private generateDeterministicTemplates(
    jobTitle: string,
    skills: string[],
    count: number,
    multiRatio: number,
  ): Omit<QuizQuestion, '_id'>[] {
    const list: Omit<QuizQuestion, '_id'>[] = [];
    const skillPool = skills.length > 0 ? skills : ['Software Architecture', 'Data Structures', 'Git', 'Testing'];

    const templates = [
      (s: string) => ({
        text: `When designing scalable architecture with ${s}, which practice best ensures high availability and fault tolerance?`,
        options: [
          'Stateless services behind load balancers with health checks',
          'Single monolithic instance with maxed memory allocation',
          'Direct client-to-database connections with no connection pooling',
          'Synchronous cascading calls across all microservices',
        ],
        correctIndex: 0,
        difficulty: 'medium' as const,
        explanation: 'Stateless services behind a load balancer eliminate single points of failure and allow horizontal scaling.',
      }),
      (s: string) => ({
        text: `Which of the following statements about memory management and lifecycle in ${s} are true?`,
        options: [
          'Unreferenced objects are eligible for garbage collection',
          'Dangling event listeners can cause persistent memory leaks',
          'All allocations reside permanently on the execution stack',
          'Circular references without weak references may prevent reclamation',
        ],
        isMultiple: true,
        correctIndices: [0, 1, 3],
        difficulty: 'hard' as const,
        explanation: 'Unreferenced objects are garbage collected, but uncleaned listeners and strong circular references cause memory leaks.',
      }),
      (s: string) => ({
        text: `What is the primary algorithmic complexity consideration when optimizing performance in ${s}?`,
        options: [
          'Preferring O(1) or O(log N) lookup data structures over O(N^2) loops',
          'Increasing thread pool count beyond hardware core capacity',
          'Avoiding all asynchronous operations in favor of blocking calls',
          'Caching every query result indefinitely without TTL or eviction',
        ],
        correctIndex: 0,
        difficulty: 'easy' as const,
        explanation: 'Minimizing time complexity via optimal data structures provides the highest scalability gains.',
      }),
      (s: string) => ({
        text: `In a production ${s} deployment, which security headers should be enforced?`,
        options: [
          'Strict-Transport-Security (HSTS)',
          'Content-Security-Policy (CSP)',
          'Access-Control-Allow-Origin: * on authenticated endpoints',
          'X-Content-Type-Options: nosniff',
        ],
        isMultiple: true,
        correctIndices: [0, 1, 3],
        difficulty: 'hard' as const,
        explanation: 'HSTS, CSP, and X-Content-Type-Options harden web security; wildcard CORS on authenticated endpoints is a vulnerability.',
      }),
      (s: string) => ({
        text: `Which testing methodology is most effective for preventing regression bugs in core ${s} workflows?`,
        options: [
          'Automated integration and end-to-end tests in CI/CD pipeline',
          'Manual sanity checking only right before major releases',
          'Skipping unit tests whenever velocity demands faster shipping',
          'Relying exclusively on user feedback in staging environments',
        ],
        correctIndex: 0,
        difficulty: 'medium' as const,
        explanation: 'Continuous integration automated testing validates regression safety upon every code change.',
      }),
      (s: string) => ({
        text: `How should database transaction boundaries be managed when updating related entities in ${s}?`,
        options: [
          'Using atomic ACID transactions with rollback on error',
          'Writing to tables sequentially without locking or transactions',
          'Ignoring foreign key constraints during batch inserts',
          'Committing partial writes immediately before validating data',
        ],
        correctIndex: 0,
        difficulty: 'medium' as const,
        explanation: 'ACID transactions ensure that either all database updates succeed or none do, maintaining state consistency.',
      }),
      (s: string) => ({
        text: `Which mechanisms provide effective rate limiting and DDoS mitigation for ${s} APIs?`,
        options: [
          'Token bucket / leaky bucket algorithms in an API Gateway',
          'IP-based rate limits with Redis sliding window tracking',
          'Completely unthrottled endpoints to minimize response latency',
          'Cloudflare or CDN-level web application firewall (WAF) filtering',
        ],
        isMultiple: true,
        correctIndices: [0, 1, 3],
        difficulty: 'hard' as const,
        explanation: 'Token buckets, Redis sliding windows, and WAF protection collectively safeguard APIs from abuse.',
      }),
      (s: string) => ({
        text: `What is the recommended approach for managing configuration and secrets in a ${s} cloud environment?`,
        options: [
          'Environment variables or a managed secret store (Vault/AWS Secrets Manager)',
          'Hardcoding credentials directly into git repository source files',
          'Committing .env files containing production API keys',
          'Exposing secret keys in public client-side javascript bundles',
        ],
        correctIndex: 0,
        difficulty: 'easy' as const,
        explanation: 'Secrets should never be committed to source control; use managed secret managers or injected environment variables.',
      }),
    ];

    let tIndex = 0;
    while (list.length < count) {
      const skill = skillPool[list.length % skillPool.length];
      const templateFn = templates[tIndex % templates.length];
      const q = templateFn(skill);
      list.push({
        text: q.text,
        options: q.options,
        isMultiple: (q as any).isMultiple || false,
        correctIndex: (q as any).correctIndex,
        correctIndices: (q as any).correctIndices,
        difficulty: q.difficulty,
        explanation: q.explanation,
      });
      tIndex++;
    }

    return list.slice(0, count);
  }
}
