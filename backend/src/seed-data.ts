import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface SeededData {
  users: any[];
  jobs: any[];
  quizzes: any[];
  courses: any[];
}

export async function generateSeedData(): Promise<SeededData> {
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. Admin Users
  const adminUser = {
    _id: new mongoose.Types.ObjectId('660000000000000000000001'),
    email: 'admin@skillverify.com',
    passwordHash: commonPasswordHash,
    role: 'admin',
    status: 'active',
    fullName: 'Tahmidul Islam (Platform Admin)',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 2. Bangladeshi Employers
  const employerBkash = {
    _id: new mongoose.Types.ObjectId('660000000000000000000010'),
    email: 'recruiter@bkash.com',
    passwordHash: commonPasswordHash,
    role: 'employer',
    status: 'active',
    companyName: 'bKash Limited',
    companyWebsite: 'https://www.bkash.com',
    contactPerson: 'Kamal Quadir (VP Talent Acquisition)',
    phone: '+880 1711-001122',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const employerPathao = {
    _id: new mongoose.Types.ObjectId('660000000000000000000011'),
    email: 'talent@pathao.com',
    passwordHash: commonPasswordHash,
    role: 'employer',
    status: 'active',
    companyName: 'Pathao Ltd.',
    companyWebsite: 'https://pathao.com',
    contactPerson: 'Fahim Saleh (Head of Tech Recruiting)',
    phone: '+880 1819-334455',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const employerBrainStation = {
    _id: new mongoose.Types.ObjectId('660000000000000000000012'),
    email: 'careers@brainstation-23.com',
    passwordHash: commonPasswordHash,
    role: 'employer',
    status: 'active',
    companyName: 'Brain Station 23',
    companyWebsite: 'https://brainstation-23.com',
    contactPerson: 'Raisul Kabir (Chief People Officer)',
    phone: '+880 1912-556677',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 3. Bangladeshi Applicants
  const applicantTanvir = {
    _id: new mongoose.Types.ObjectId('660000000000000000000020'),
    email: 'tanvir.ahmed@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Tanvir Ahmed',
    phone: '+880 1711-234567',
    headline: 'Senior Full-Stack & Distributed Systems Engineer',
    skills: ['Node.js', 'NestJS', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis'],
    education: [
      {
        institution: 'Bangladesh University of Engineering and Technology (BUET)',
        degree: 'B.Sc. in Computer Science & Engineering',
        fieldOfStudy: 'Software Engineering',
        startYear: 2018,
        endYear: 2022,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'Chaldal Tech',
        title: 'Software Engineer II',
        description: 'Engineered high-throughput inventory routing and payment settlement services.',
        startDate: '2022-07-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'tanvir-ahmed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantNusrat = {
    _id: new mongoose.Types.ObjectId('660000000000000000000021'),
    email: 'nusrat.jahan@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Nusrat Jahan',
    phone: '+880 1812-345678',
    headline: 'Lead Frontend Architect | Next.js, React 18 & Design Systems',
    skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux Toolkit', 'Storybook', 'Web Vitals'],
    education: [
      {
        institution: 'University of Dhaka',
        degree: 'B.Sc. in Computer Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2019,
        endYear: 2023,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'Inovace Technologies',
        title: 'Frontend Engineer',
        description: 'Developed modern responsive dashboards and real-time telemetry visualizers.',
        startDate: '2023-02-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'nusrat-jahan',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantShakib = {
    _id: new mongoose.Types.ObjectId('660000000000000000000022'),
    email: 'shakib.dev@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Shakibul Hasan',
    phone: '+880 1913-456789',
    headline: 'Cloud & DevOps Architect | Kubernetes, Terraform & AWS',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Go', 'Prometheus', 'Linux'],
    education: [
      {
        institution: 'Islamic University of Technology (IUT)',
        degree: 'B.Sc. in Computer Science & Engineering',
        fieldOfStudy: 'Distributed Systems',
        startYear: 2017,
        endYear: 2021,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'SureCash BD',
        title: 'DevOps Engineer',
        description: 'Automated multi-region Kubernetes deployments and established zero-trust GitOps workflows.',
        startDate: '2021-09-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'shakibul-hasan',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantTasnim = {
    _id: new mongoose.Types.ObjectId('660000000000000000000023'),
    email: 'tasnim.rahman@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Tasnim Rahman',
    phone: '+880 1614-567890',
    headline: 'Machine Learning & Generative AI Specialist | LLMs, PyTorch & LangChain',
    skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Vector Databases', 'Hugging Face', 'Docker'],
    education: [
      {
        institution: 'BRAC University',
        degree: 'B.Sc. in Computer Science',
        fieldOfStudy: 'Artificial Intelligence',
        startYear: 2020,
        endYear: 2024,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'Intelligent Machines Lab',
        title: 'Junior AI Engineer',
        description: 'Built RAG pipelines with vector indices and fine-tuned open-source LLMs for Bangla NLP.',
        startDate: '2024-02-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'tasnim-rahman',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantAbrar = {
    _id: new mongoose.Types.ObjectId('660000000000000000000024'),
    email: 'abrar.fahad@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Abrar Fahad',
    phone: '+880 1515-678901',
    headline: 'Mobile Application Engineer | Flutter, Dart & React Native',
    skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'State Management', 'REST APIs', 'SQLite'],
    education: [
      {
        institution: 'United International University (UIU)',
        degree: 'B.Sc. in Computer Science & Engineering',
        fieldOfStudy: 'Mobile Computing',
        startYear: 2019,
        endYear: 2023,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'Sheba.xyz',
        title: 'Mobile Engineer',
        description: 'Published rider and merchant Flutter applications with offline synchronization and push alerts.',
        startDate: '2023-04-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'abrar-fahad',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantFarhana = {
    _id: new mongoose.Types.ObjectId('660000000000000000000025'),
    email: 'farhana.yasmin@gmail.com',
    passwordHash: commonPasswordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Farhana Yasmin',
    phone: '+880 1716-789012',
    headline: 'QA Automation Engineer | Cypress, Jest, Playwright & Performance Testing',
    skills: ['Cypress', 'Playwright', 'Jest', 'Selenium', 'JavaScript', 'CI/CD Pipelines', 'Postman'],
    education: [
      {
        institution: 'North South University (NSU)',
        degree: 'B.Sc. in Electrical and Computer Engineering',
        fieldOfStudy: 'Software Quality Assurance',
        startYear: 2019,
        endYear: 2023,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'Enosis Solutions',
        title: 'Software Quality Assurance Engineer',
        description: 'Authored end-to-end automated regression suites reducing release turnaround by 40%.',
        startDate: '2023-06-01',
        isCurrent: true,
      },
    ],
    isPublic: true,
    publicSlug: 'farhana-yasmin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const users = [
    adminUser,
    employerBkash,
    employerPathao,
    employerBrainStation,
    applicantTanvir,
    applicantNusrat,
    applicantShakib,
    applicantTasnim,
    applicantAbrar,
    applicantFarhana,
  ];

  // 4. Job Posts, Quizzes, and Grooming Courses
  const jobs: any[] = [];
  const quizzes: any[] = [];
  const courses: any[] = [];

  // Helper to construct questions with IDs
  const createQ = (
    text: string,
    options: string[],
    correctIndex: number,
    explanation: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    isMultiple: boolean = false,
    correctIndices: number[] = [],
  ) => ({
    _id: new mongoose.Types.ObjectId(),
    text,
    options,
    correctIndex,
    explanation,
    difficulty,
    isMultiple,
    correctIndices: isMultiple ? correctIndices : [correctIndex],
  });

  // ==========================================
  // EMPLOYER 1: bKash Limited
  // Job 1: Senior Backend Engineer (Fintech & Payments)
  // ==========================================
  const jobBkash1Id = new mongoose.Types.ObjectId('660000000000000000000101');
  const quizBkash1Id = new mongoose.Types.ObjectId('660000000000000000000201');
  const courseBkash1Id = new mongoose.Types.ObjectId('660000000000000000000301');

  const quizBkash1Questions = [
    createQ(
      'In a high-concurrency payment gateway, which database isolation level best prevents phantom reads and race conditions during balance deductions?',
      ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      3,
      'Serializable isolation provides the strictest consistency guarantee, preventing phantom reads, non-repeatable reads, and write skew in ledger balances.',
      'hard',
    ),
    createQ(
      'Which pattern ensures that microservice message publishing and database writes happen atomically without two-phase commit?',
      ['Saga Pattern', 'Transactional Outbox Pattern', 'CQRS Pattern', 'Circuit Breaker Pattern'],
      1,
      'The Transactional Outbox Pattern commits events to an outbox table in the same local ACID transaction as entity mutations, ensuring reliable delivery.',
      'medium',
    ),
    createQ(
      'Which of the following idempotency techniques are crucial when designing RESTful payment processing endpoints? (Select all that apply)',
      [
        'Client-supplied unique Idempotency-Key headers stored in a fast key-value cache (Redis)',
        'Database unique constraints on order reference IDs',
        'Executing non-idempotent raw balance increments unconditionally',
        'Returning cached transaction receipts when a duplicate request arrives',
      ],
      0,
      'Idempotency keys, database unique constraints, and returning deterministic cached responses protect financial pipelines from duplicate billing.',
      'hard',
      true,
      [0, 1, 3],
    ),
    createQ(
      'What Redis data structure is most appropriate for token bucket rate limiting on high-frequency API gateways?',
      ['Redis Strings with INCR and EXPIRE', 'Redis Sorted Sets (ZSET) storing timestamps', 'Redis Bitmaps', 'Redis HyperLogLog'],
      1,
      'Sorted Sets (ZSET) allow sliding window rate limiting by scoring timestamps and pruning expired entries with ZREMRANGEBYSCORE.',
      'medium',
    ),
    createQ(
      'What is the primary operational purpose of the Circuit Breaker pattern in microservice communications?',
      [
        'To speed up database indexing queries',
        'To fail fast and prevent cascading system failures when downstream services are degraded',
        'To decrypt incoming SSL certificates at the edge',
        'To balance traffic evenly across Docker containers',
      ],
      1,
      'Circuit Breakers fail fast after repeated errors, allowing downstream services recovery time and preserving upstream health.',
      'medium',
    ),
    createQ(
      'In PostgreSQL, which locking mechanism should be used in a SELECT statement to safely read and immediately lock account rows for update?',
      ['SELECT ... FOR SHARE', 'SELECT ... FOR UPDATE', 'SELECT ... LOCK IN SHARE MODE', 'SELECT ... WITH NOLOCK'],
      1,
      'SELECT ... FOR UPDATE acquires an exclusive lock on selected rows, ensuring competing transactions wait until the current transaction commits.',
      'medium',
    ),
    createQ(
      'Which HTTP status code is universally recommended when a client submits a valid request that cannot be processed due to a business rule (e.g., insufficient funds)?',
      ['400 Bad Request', '404 Not Found', '422 Unprocessable Entity', '500 Internal Server Error'],
      2,
      '422 Unprocessable Entity indicates semantic errors where the payload syntax is correct but domain validation rules fail.',
      'easy',
    ),
    createQ(
      'How does JWT signature verification work on a protected backend microservice?',
      [
        'Backend looks up the token string in an external database table on every single request',
        'Backend verifies the cryptographic HMAC or RSA/ECDSA signature using a secret/public key without external DB queries',
        'Backend sends the JWT to the browser to decrypt it with private cookies',
        'Backend queries the frontend server for authorization clearance',
      ],
      1,
      'Stateless JWT validation recalculates the cryptographic signature against the token payload and secret key.',
      'medium',
    ),
    createQ(
      'Which message delivery guarantee does Apache Kafka provide out-of-the-box when producers use default acknowledgments?',
      ['Exactly-once delivery', 'At-least-once delivery', 'At-most-once delivery', 'Zero-loss zero-retry delivery'],
      1,
      'Standard Kafka acknowledgment patterns provide at-least-once semantics, requiring consumer idempotency.',
      'medium',
    ),
    createQ(
      'Which of the following security practices are required for PCI-DSS compliance in payment software? (Select all that apply)',
      [
        'Never storing raw CVV/CVC numbers after transaction authorization',
        'Encrypting cardholder data both at rest and in transit using TLS 1.3/AES-256',
        'Writing raw PAN numbers into application debug log files for audits',
        'Enforcing role-based access control and detailed immutable audit logs',
      ],
      0,
      'PCI-DSS strictly prohibits saving CVV codes, requires robust encryption, and mandates role-based audit logs while banning cleartext PAN logging.',
      'hard',
      true,
      [0, 1, 3],
    ),
  ];

  const courseBkash1Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: ACID Transactions & Concurrency Control in Banking',
      type: 'text',
      order: 1,
      content: {
        text: 'This module covers PostgreSQL MVCC, transaction isolation levels (Repeatable Read vs Serializable), row-level locking strategies (SELECT FOR UPDATE NOWAIT), and preventing write skew in double-entry ledger ledgers.',
      },
      checkpoint: {
        questions: [
          createQ(
            'What happens when two concurrent transactions run SELECT ... FOR UPDATE on the exact same row?',
            ['Both execute immediately without delay', 'The second transaction blocks until the first transaction commits or rolls back', 'PostgreSQL instantly terminates the database server', 'The table is converted to unlogged mode'],
            1,
            'The second transaction waits for the lock to be released upon transaction completion.',
          ),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Transactional Outbox Pattern & Distributed Messaging',
      type: 'text',
      order: 2,
      content: {
        text: 'Learn how to implement the Outbox pattern with Debezium CDC and Kafka or RabbitMQ. Understand dual-write hazards and why committing local database changes alongside message dispatches guarantees at-least-once message delivery.',
      },
      checkpoint: {
        questions: [
          createQ(
            'Why is direct dual-writing (DB write followed by message broker publish) vulnerable in distributed architectures?',
            ['It uses too little network bandwidth', 'If the broker publish fails after the DB commits, the event is permanently lost', 'Message brokers do not accept JSON data', 'Relational databases prohibit external network calls'],
            1,
            'A crash or network glitch between DB commit and broker publish causes silent state divergence.',
          ),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Idempotent API Design & Sliding-Window Rate Limiting',
      type: 'text',
      order: 3,
      content: {
        text: 'Master the design of production-grade Idempotency-Key middlewares using Redis atomic operations (SET key value NX EX). Explore Redis token buckets and sliding log rate limiters to defend fintech endpoints from replay attacks.',
      },
      checkpoint: {
        questions: [
          createQ(
            'Which Redis command atomically sets a key only if it does not already exist with an expiration window?',
            ['MSET key val', 'SET key val NX EX 86400', 'APPEND key val', 'HSET key field val'],
            1,
            'SET ... NX EX atomically writes and assigns a TTL only if the key is vacant.',
          ),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobBkash1Id,
    employerId: employerBkash._id,
    companyName: 'bKash Limited',
    title: 'Senior Backend Engineer (Fintech & Core Transactions)',
    description: `bKash is searching for an experienced Senior Backend Engineer to architect and scale our core payment settlement and merchant gateway services.\n\nKey Responsibilities:\n• Architect fault-tolerant financial settlement services in NestJS and Go.\n• Optimize PostgreSQL database transactions and distributed Redis locking.\n• Ensure zero downtime and sub-50ms latency across millions of daily MFS transactions.`,
    requiredSkills: ['Node.js', 'NestJS', 'PostgreSQL', 'Microservices', 'Redis', 'Kafka'],
    location: 'Dhaka, Bangladesh (Shadhinata Tower, Gulshan-2)',
    salaryRange: { min: 140000, max: 220000, currency: 'BDT' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizBkash1Id,
    courseId: courseBkash1Id,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizBkash1Id,
    jobId: jobBkash1Id,
    employerId: employerBkash._id,
    passingScore: 70,
    timeLimit: 15,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizBkash1Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: courseBkash1Id,
    jobId: jobBkash1Id,
    employerId: employerBkash._id,
    title: 'High-Throughput Financial Systems & Transaction Isolation',
    description: 'Mandatory grooming curriculum covering ACID guarantees, distributed idempotency, outbox patterns, and sliding rate limiters.',
    modules: courseBkash1Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==========================================
  // EMPLOYER 1: bKash Limited
  // Job 2: Lead Cloud & Kubernetes Platform Engineer
  // ==========================================
  const jobBkash2Id = new mongoose.Types.ObjectId('660000000000000000000102');
  const quizBkash2Id = new mongoose.Types.ObjectId('660000000000000000000202');
  const courseBkash2Id = new mongoose.Types.ObjectId('660000000000000000000302');

  const quizBkash2Questions = [
    createQ('What is the function of the Kubernetes kube-controller-manager?', ['Runs container images on worker nodes', 'Continuously drives cluster actual state toward the desired state defined in manifests', 'Exposes the raw etcd database directly over HTTP', 'Provides client TLS termination'], 1, 'Controller manager runs reconciliation loops to maintain desired replica and resource state.', 'medium'),
    createQ('Which Kubernetes resource type is best suited for running stateful database instances requiring stable network identities and dedicated persistent volumes?', ['Deployment', 'StatefulSet', 'DaemonSet', 'ReplicaSet'], 1, 'StatefulSets provide persistent hostnames and 1:1 volume attachment across pod restarts.', 'medium'),
    createQ('Which of the following Terraform commands creates an execution plan and updates the actual cloud infrastructure? (Select all that apply)', ['terraform validate', 'terraform apply', 'terraform init', 'terraform plan'], 1, 'terraform apply creates an execution plan and provisions the infrastructure changes.', 'easy'),
    createQ('In Docker multi-stage builds, what is the primary benefit of discarding earlier build stages?', ['Faster CPU clock speeds', 'Drastically reduced production container image size and reduced attack surface', 'Automatic deployment to Kubernetes', 'Elimination of all environment variables'], 1, 'Multi-stage builds leave compiler tools and dependencies behind, leaving minimal production runtimes.', 'easy'),
    createQ('Which Prometheus metric type is designed for monotonically increasing counters that can reset only on process restart?', ['Gauge', 'Counter', 'Histogram', 'Summary'], 1, 'Counters only increment, making them ideal for counting requests, errors, and system events.', 'easy'),
    createQ('Which of the following techniques harden Kubernetes clusters against unauthorized container breakout? (Select all that apply)', ['Setting readOnlyRootFilesystem: true in securityContext', 'Running containers as non-root users (runAsNonRoot: true)', 'Mounting the Docker socket /var/run/docker.sock inside untrusted customer pods', 'Disabling Linux capabilities such as CAP_SYS_ADMIN'], 0, 'Restricting file system writes, non-root users, and dropping dangerous Linux capabilities form core container hardening.', 'hard', true, [0, 1, 3]),
    createQ('What does the Kubernetes Horizontal Pod Autoscaler (HPA) inspect by default to trigger scaling events?', ['Pod memory and CPU utilization metrics from metrics-server', 'Local hard drive temperature', 'The number of developers connected over SSH', 'Container log file line count'], 0, 'HPA uses target metrics like CPU and memory percentages reported by metrics-server.', 'easy'),
    createQ('In AWS VPC networking, what distinguishes a Private Subnet from a Public Subnet?', ['Private Subnets cannot run EC2 instances', 'Public Subnets have a direct route table entry to an Internet Gateway (IGW)', 'Private Subnets have no IP addresses', 'Public Subnets are managed exclusively by Google Cloud'], 1, 'A route table entry pointing 0.0.0.0/0 to an IGW makes a subnet public.', 'medium'),
    createQ('What is GitOps fundamentally characterized by?', ['Storing application source code in private zip files', 'Using Git repositories as the single source of truth for declaratively managed infrastructure and deployments', 'Executing manual kubectl apply commands directly on production servers', 'Writing server bash scripts by hand on live instances'], 1, 'GitOps uses Git version control as the canonical declaration for continuous reconciliation by agents like ArgoCD.', 'medium'),
    createQ('Which TLS protocol version completely dropped support for insecure legacy cipher suites like RC4, DES, and CBC modes?', ['TLS 1.0', 'TLS 1.1', 'TLS 1.2', 'TLS 1.3'], 3, 'TLS 1.3 removed legacy algorithms and streamlined the handshake to a single round-trip.', 'hard'),
  ];

  const courseBkash2Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: Kubernetes Cluster Architecture & Pod Security Standards',
      type: 'text',
      order: 1,
      content: {
        text: 'Examine Kubernetes control plane internals (etcd, kube-apiserver, scheduler) and implement Pod Security Standards (Privileged, Baseline, Restricted). Learn NetworkPolicies for zero-trust microservice isolation.',
      },
      checkpoint: {
        questions: [
          createQ('Which Kubernetes resource restricts pod-to-pod traffic based on IP blocks and pod label selectors?', ['Ingress', 'NetworkPolicy', 'ServiceAccount', 'ConfigMap'], 1, 'NetworkPolicies act as layer 3/4 firewalls inside the Kubernetes cluster.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Infrastructure as Code (IaC) with Terraform & GitOps',
      type: 'text',
      order: 2,
      content: {
        text: 'Structuring modular Terraform workspaces, remote S3 state locking with DynamoDB, and building continuous automated deployment pipelines with ArgoCD and GitHub Actions.',
      },
      checkpoint: {
        questions: [
          createQ('Why is remote state locking essential when collaborating on Terraform projects in teams?', ['It compresses Terraform code', 'It prevents concurrent apply operations that could corrupt the state file', 'It creates AWS accounts automatically', 'It decrypts local hard drives'], 1, 'State locking ensures only one process mutates infrastructure state at any time.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Observability & Incident Response with Prometheus & Grafana',
      type: 'text',
      order: 3,
      content: {
        text: 'Instrumenting services with Prometheus client libraries, defining meaningful Golden Signals (Latency, Traffic, Errors, Saturation), and configuring Alertmanager escalation policies.',
      },
      checkpoint: {
        questions: [
          createQ('Which of the following constitutes one of Google SRE Four Golden Signals?', ['Compilation Speed', 'Latency', 'Code Comments', 'Monitor Refresh Rate'], 1, 'The 4 Golden Signals are Latency, Traffic, Errors, and Saturation.'),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobBkash2Id,
    employerId: employerBkash._id,
    companyName: 'bKash Limited',
    title: 'Lead Cloud & Kubernetes Platform Engineer',
    description: `Join bKash to spearhead our mission-critical hybrid cloud infrastructure. You will oversee multi-region Kubernetes clusters, automated GitOps pipelines, and enterprise security compliance.\n\nKey Responsibilities:\n• Manage high-availability production Kubernetes clusters on AWS and on-premise bare-metal.\n• Define infrastructure as code with Terraform and manage continuous GitOps with ArgoCD.\n• Implement zero-trust network policies and real-time observability telemetry.`,
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Prometheus', 'Linux'],
    location: 'Dhaka, Bangladesh (Hybrid)',
    salaryRange: { min: 160000, max: 250000, currency: 'BDT' },
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizBkash2Id,
    courseId: courseBkash2Id,
    passingScore: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizBkash2Id,
    jobId: jobBkash2Id,
    employerId: employerBkash._id,
    passingScore: 75,
    timeLimit: 20,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizBkash2Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: courseBkash2Id,
    jobId: jobBkash2Id,
    employerId: employerBkash._id,
    title: 'Zero-Downtime Deployment & Kubernetes Cluster Security',
    description: 'Advanced platform engineering training focusing on Kubernetes pod security standards, Terraform remote state locking, and SRE golden signals.',
    modules: courseBkash2Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==========================================
  // EMPLOYER 2: Pathao Ltd.
  // Job 1: Senior Mobile Engineer (Flutter & Offline Systems)
  // ==========================================
  const jobPathao1Id = new mongoose.Types.ObjectId('660000000000000000000103');
  const quizPathao1Id = new mongoose.Types.ObjectId('660000000000000000000203');
  const coursePathao1Id = new mongoose.Types.ObjectId('660000000000000000000303');

  const quizPathao1Questions = [
    createQ('In Flutter, what is the key difference between the Widget tree and the Element tree?', ['Widgets are mutable rendering buffers; Elements are immutable configurations', 'Widgets are immutable configurations; Elements represent the instantiated nodes managing the lifecycle and state', 'Widgets run in C++; Elements run in JavaScript', 'There is no difference; they are aliases for the same object'], 1, 'Widgets are lightweight immutable blueprints, while Elements manage the structural lifecycle and reconciliation.', 'medium'),
    createQ('Which Dart feature allows asynchronous operations to yield multiple values over time as data arrives?', ['Future<T>', 'Stream<T>', 'Iterable<T>', 'Isolate<T>'], 1, 'Streams provide an asynchronous sequence of events over time.', 'easy'),
    createQ('Which of the following state management solutions in Flutter rely on InheritedWidget under the hood? (Select all that apply)', ['Provider', 'Riverpod', 'ScopedModel', 'Raw global static variables'], 0, 'Provider and ScopedModel both wrap InheritedWidget for efficient tree-based state propagation.', 'medium', true, [0, 2]),
    createQ('How does Flutter execute heavy computational tasks without causing UI jank or dropping 60/120fps frame rates?', ['By running computations inside async/await on the main thread', 'By offloading CPU-intensive workloads to a separate Dart Isolate with its own memory heap', 'By rendering frames through an HTML iframe', 'By disabling the garbage collector'], 1, 'Dart isolates do not share memory; spawning an isolate runs compute tasks on another thread without blocking UI.', 'medium'),
    createQ('Which mobile database is best suited for cross-platform local key-value and object caching with synchronous read capability in Flutter?', ['Hive', 'Firebase Realtime Database', 'MySQL Server', 'PostgreSQL Cloud'], 0, 'Hive is a fast, lightweight, NoSQL key-value database written purely in Dart with fast memory caching.', 'easy'),
    createQ('In mobile geolocation tracking, which strategy preserves battery life while maintaining accurate breadcrumbs during ride deliveries?', ['Pinging GPS coordinates every 100 milliseconds constantly', 'Distance-filtered position updates combined with device accelerometer activity recognition', 'Keeping the phone screen permanently active at max brightness', 'Using Bluetooth scans only'], 1, 'Combining distance filters (e.g. update only after 10m movement) and activity detection conserves device battery.', 'medium'),
    createQ('What does Flutter `const` constructor optimization achieve?', ['It tells the compiler to allocate new memory on every build() call', 'It creates canonicalized instances at compile-time, allowing Flutter to short-circuit rebuilding the widget subtree', 'It enables web socket connectivity', 'It translates Dart code to Python bytecode'], 1, 'const widgets are instantiated once at compile time, skipping unnecessary reconciliation.', 'medium'),
    createQ('What is the role of Flutter platform channels (MethodChannel)?', ['Enables bidirectional asynchronous messaging between Dart code and native platform code (Kotlin/Swift)', 'Connects the Flutter app to the Google Play Store directly', 'Automatically generates App Store screenshots', 'Translates Dart strings to foreign languages'], 0, 'MethodChannels serialize messages across the bridge to execute native iOS and Android SDK APIs.', 'easy'),
    createQ('Which HTTP response header should mobile apps inspect to prevent aggressive caching of dynamic ride fare quotations?', ['Content-Type: text/html', 'Cache-Control: no-store, no-cache, must-revalidate', 'Access-Control-Allow-Origin: *', 'Server: nginx'], 1, 'Cache-Control: no-store tells HTTP clients not to cache non-replayable fare quotes.', 'easy'),
    createQ('Which of the following considerations are critical when implementing offline-first syncing in mobile logistics apps? (Select all that apply)', ['Persisting pending operations in a durable local queue (SQLite/Hive)', 'Conflict resolution strategies (e.g., Last-Write-Wins or server vector clocks)', 'Silently discarding mutations if the device goes offline for 5 seconds', 'Exponential backoff retry policies on network recovery'], 0, 'Durable offline queues, robust conflict resolution, and exponential backoff ensure reliable offline recovery.', 'hard', true, [0, 1, 3]),
  ];

  const coursePathao1Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: Flutter Internal Rendering Pipeline & Isolate Concurrency',
      type: 'text',
      order: 1,
      content: {
        text: 'Deep dive into the 3 trees (Widget, Element, RenderObject), Skia/Impeller rendering pipeline, and using compute() and worker Isolates to prevent frame drops in mobile apps.',
      },
      checkpoint: {
        questions: [
          createQ('Which tree in Flutter is directly responsible for computing layout constraints, sizing, and painting to screen?', ['Widget Tree', 'Element Tree', 'RenderObject Tree', 'DOM Tree'], 2, 'RenderObjects perform the actual geometry calculation, constraint negotiation, and painting.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Battery-Efficient Geolocation & Real-Time Tracking',
      type: 'text',
      order: 2,
      content: {
        text: 'Implementing background location services on iOS and Android. Configuring distance filters, geofencing, Kalman filtering for GPS jitter smoothing, and WebSocket telemetry streams.',
      },
      checkpoint: {
        questions: [
          createQ('Why is a Kalman filter often applied to raw mobile GPS coordinate streams?', ['To compress GPS files into zip archives', 'To smooth noisy measurements and accurately estimate true device trajectory', 'To encrypt coordinates for banking transactions', 'To generate fake coordinates for testing'], 1, 'Kalman filters estimate the true state by recursively filtering out noisy sensor variance.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Durable Offline-First Architecture & Sync Queues',
      type: 'text',
      order: 3,
      content: {
        text: 'Architecting local transactional queues with Drift or Hive. Managing network connectivity broadcasts, two-phase synchronization, and conflict resolution during rider trip progress.',
      },
      checkpoint: {
        questions: [
          createQ('What must happen when a mobile app regains internet connectivity with 5 queued offline actions?', ['Discard all queued actions', 'Drain the queue in strict chronological order with exponential backoff on retryable failures', 'Restart the smartphone', 'Show an immediate fatal error to the user'], 1, 'The queue should be processed sequentially with idempotency keys and error handling.'),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobPathao1Id,
    employerId: employerPathao._id,
    companyName: 'Pathao Ltd.',
    title: 'Senior Mobile Engineer (Flutter & Ride Delivery Systems)',
    description: `Pathao is looking for an elite Senior Mobile Engineer to build our next-generation super-app experiences across ride-sharing, food delivery, and logistics.\n\nKey Responsibilities:\n• Architect scalable, offline-first mobile features in Flutter & Dart.\n• Engineer ultra-reliable real-time driver tracking and battery-efficient GPS pipelines.\n• Maintain strict 60fps rendering benchmarks and zero crash rates across diverse Android/iOS devices.`,
    requiredSkills: ['Flutter', 'Dart', 'State Management', 'REST APIs', 'SQLite', 'WebSockets'],
    location: 'Dhaka, Bangladesh (Bir Uttam Mir Shawkat Sarak, Tejgaon)',
    salaryRange: { min: 120000, max: 180000, currency: 'BDT' },
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizPathao1Id,
    courseId: coursePathao1Id,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizPathao1Id,
    jobId: jobPathao1Id,
    employerId: employerPathao._id,
    passingScore: 70,
    timeLimit: 15,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizPathao1Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: coursePathao1Id,
    jobId: jobPathao1Id,
    employerId: employerPathao._id,
    title: 'Mobile Architecture, Offline Caching & Geolocation Tracking',
    description: 'Pathao masterclass covering Flutter render objects, background GPS optimization, Kalman filtering, and resilient offline synchronization.',
    modules: coursePathao1Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==========================================
  // EMPLOYER 2: Pathao Ltd.
  // Job 2: Frontend Engineer (Design Systems & React)
  // ==========================================
  const jobPathao2Id = new mongoose.Types.ObjectId('660000000000000000000104');
  const quizPathao2Id = new mongoose.Types.ObjectId('660000000000000000000204');
  const coursePathao2Id = new mongoose.Types.ObjectId('660000000000000000000304');

  const quizPathao2Questions = [
    createQ('What is the core advantage of using CSS subgrid in modern responsive design systems?', ['It enables CSS to run in web workers', 'It allows nested grid items to align seamlessly with the parent grid tracks and column lines', 'It removes all need for media queries permanently', 'It automatically compiles CSS to SCSS'], 1, 'Subgrid allows child elements to adopt the track definitions of their direct parent grid container.', 'medium'),
    createQ('In React, when should `useMemo` be avoided?', ['When computing cheap arithmetic or lightweight string concatenations where the hook overhead exceeds recalculation', 'When sorting arrays of 50,000 items', 'When passing objects into memoized child components', 'Inside high-performance canvas loops'], 0, 'useMemo incurs memory and dependency comparison costs that outweigh trivial calculations.', 'medium'),
    createQ('Which Core Web Vital measures the visual stability of a webpage to prevent annoying layout jumps?', ['LCP (Largest Contentful Paint)', 'INP (Interaction to Next Paint)', 'CLS (Cumulative Layout Shift)', 'TTFB (Time to First Byte)'], 2, 'Cumulative Layout Shift quantifies unexpected layout movement during page rendering.', 'easy'),
    createQ('Which of the following methods improve web bundle loading performance? (Select all that apply)', ['Route-based code splitting using React.lazy and dynamic import()', 'Serving responsive WebP/AVIF images with width and height descriptors', 'Embedding full uncompressed 20MB video files inside client JavaScript bundles', 'Tree-shaking unused package exports through modern ES module bundlers'], 0, 'Code splitting, modern image compression, and tree shaking optimize initial page load times.', 'medium', true, [0, 1, 3]),
    createQ('What does the CSS property `contain: content` tell the browser rendering engine?', ['The element is completely invisible', 'The element internal layout and paint are isolated from the rest of the document tree, reducing reflow scope', 'The element must be rendered as raw plain text', 'The element font size cannot change'], 1, 'CSS containment signals that an element subtree is independent, limiting browser reflow and repaint costs.', 'hard'),
    createQ('In TypeScript, what is a discriminated union?', ['A type created by concatenating two string literals with an underscore', 'A union of object types that share a common literal discriminator property allowing type narrowing', 'A union that can only hold boolean values', 'A class constructor that throws an error on initialization'], 1, 'Discriminated unions possess a common property (e.g., type or kind) enabling safe type guards in switch blocks.', 'medium'),
    createQ('What happens if you omit the dependency array in a `useEffect` hook?', ['The effect will run only once when the component mounts', 'The effect will run after every single render of the component', 'The effect will never execute', 'React throws a fatal compilation error'], 1, 'Without a dependency array, useEffect executes after every render cycle.', 'easy'),
    createQ('What is the primary benefit of React Server Components (RSC)?', ['Zero client bundle size for server-only dependencies and direct database/backend resource access during rendering', 'Replacing all frontend HTML with SVG canvases', 'Removing the need for web browsers', 'Enabling React to run in command-line terminals'], 0, 'RSCs execute on the server, streaming lightweight serialized UI to the client without shipping server package dependencies.', 'hard'),
    createQ('Which HTTP header helps protect web applications against clickjacking attacks by controlling if a page can be framed?', ['X-Frame-Options: DENY', 'Content-Security-Policy: default-src self', 'X-Content-Type-Options: nosniff', 'Both A and B are effective against clickjacking'], 3, 'Both X-Frame-Options and CSP frame-ancestors directives safeguard sites from clickjacking.', 'medium'),
    createQ('What is the difference between shallow routing and deep client navigation in modern single-page applications?', ['Shallow routing updates the URL pathname/query params without re-running data fetching lifecycle hooks', 'Shallow routing shuts down the browser tab', 'Deep routing cannot access URL search parameters', 'There is no technical difference'], 0, 'Shallow routing alters browser history and URL state without triggering heavy data refetches.', 'medium'),
  ];

  const coursePathao2Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: Atomic Design Systems & Accessible Component Libraries',
      type: 'text',
      order: 1,
      content: {
        text: 'Constructing robust UI component libraries following WCAG 2.1 AA accessibility guidelines, ARIA attributes, keyboard navigation traps, and TailwindCSS design tokens.',
      },
      checkpoint: {
        questions: [
          createQ('Which ARIA attribute informs screen readers that a live region of the page has updated with dynamic content?', ['aria-hidden', 'aria-live', 'aria-label', 'aria-disabled'], 1, 'aria-live="polite" or "assertive" announces real-time dynamic UI updates to assistive technologies.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Core Web Vitals (LCP, INP, CLS) Tuning & Performance Profiling',
      type: 'text',
      order: 2,
      content: {
        text: 'Diagnosing layout shifts with Chrome DevTools Performance panel, eliminating long tasks (>50ms) to pass INP thresholds, and automating Lighthouse audits in CI/CD.',
      },
      checkpoint: {
        questions: [
          createQ('What is the recommended threshold for a "Good" Interaction to Next Paint (INP) score?', ['Under 200 milliseconds', 'Under 2 seconds', 'Under 10 seconds', 'Zero milliseconds always'], 0, 'Google specifies an INP under 200ms as good responsive responsiveness.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Advanced TypeScript Patterns & React 18 Concurrent Hooks',
      type: 'text',
      order: 3,
      content: {
        text: 'Leveraging useDeferredValue, useTransition, discriminated unions, and branded types to build type-safe, non-blocking customer dashboards.',
      },
      checkpoint: {
        questions: [
          createQ('How does useTransition assist when rendering large, computationally heavy data tables?', ['It skips rendering the table completely', 'It marks the state update as non-urgent, keeping user typing and interaction responsive', 'It compiles React code to WebAssembly', 'It saves the table to local storage'], 1, 'useTransition permits urgent updates like keystrokes to interrupt non-urgent list rendering.'),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobPathao2Id,
    employerId: employerPathao._id,
    companyName: 'Pathao Ltd.',
    title: 'Frontend Engineer (Design Systems & Web Experience)',
    description: `Build delightful, ultra-accessible merchant and courier portal interfaces for millions of users across Bangladesh and Nepal.\n\nKey Responsibilities:\n• Develop reusable component systems using React, TypeScript, and TailwindCSS.\n• Continuously profile web performance and maintain strict Core Web Vitals ratings.\n• Collaborate with UX designers on responsive design tokens and accessibility guidelines.`,
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Redux Toolkit', 'Web Performance'],
    location: 'Dhaka, Bangladesh (Tejgaon)',
    salaryRange: { min: 90000, max: 150000, currency: 'BDT' },
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizPathao2Id,
    courseId: coursePathao2Id,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizPathao2Id,
    jobId: jobPathao2Id,
    employerId: employerPathao._id,
    passingScore: 70,
    timeLimit: 15,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizPathao2Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: coursePathao2Id,
    jobId: jobPathao2Id,
    employerId: employerPathao._id,
    title: 'Component Driven Architecture & Web Vitals Optimization',
    description: 'Practical training on WCAG accessibility, Chrome Performance profiling, INP tuning, and modern React 18 concurrent transitions.',
    modules: coursePathao2Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==========================================
  // EMPLOYER 3: Brain Station 23
  // Job 1: Full-Stack Engineer (Enterprise Cloud Solutions)
  // ==========================================
  const jobBS1Id = new mongoose.Types.ObjectId('660000000000000000000105');
  const quizBS1Id = new mongoose.Types.ObjectId('660000000000000000000205');
  const courseBS1Id = new mongoose.Types.ObjectId('660000000000000000000305');

  const quizBS1Questions = [
    createQ('In a NestJS application, what is the role of Dependency Injection (DI) through Providers?', ['It creates global singleton variables in window memory', 'It decouples class dependencies and delegates instantiation to the IoC container', 'It generates database tables automatically on every request', 'It compiles TypeScript into machine code'], 1, 'Inversion of Control (IoC) decouples consumers from dependency creation, facilitating testing and modularity.', 'medium'),
    createQ('What is the difference between Authentication and Authorization in web security?', ['Authentication verifies identity; Authorization verifies permissions to access specific resources', 'Authentication assigns roles; Authorization validates passwords', 'There is no difference; they are interchangeable', 'Authentication is only used for admin users'], 0, 'Authentication answers "Who are you?", while Authorization answers "What are you permitted to do?".', 'easy'),
    createQ('Which MongoDB index type is required to perform fast case-insensitive full-text keyword searches across multiple fields?', ['Unique Index', 'Compound Index', 'Text Index', 'TTL Index'], 2, 'MongoDB text indexes support text queries and relevance scoring across string fields.', 'easy'),
    createQ('Which of the following practices prevent SQL/NoSQL Injection vulnerabilities? (Select all that apply)', ['Using parameterized queries and ORM/ODM model abstractions', 'Sanitizing user input with schema validators (class-validator)', 'Concatenating raw user strings directly into query statements', 'Rejecting unexpected query operators like $gt or $ne in API request bodies'], 0, 'Parameterized queries, schema validation, and operator sanitization eliminate injection risks.', 'medium', true, [0, 1, 3]),
    createQ('In Node.js, what executes in the Event Loop Microtask Queue before Macrotasks (e.g., setTimeout)?', ['process.nextTick() callbacks and resolved Promise handlers', 'fs.readFile callbacks', 'setImmediate callbacks', 'HTTP socket write operations'], 0, 'Microtasks (Promises and process.nextTick) drain immediately upon the completion of the current operation before Macrotasks.', 'hard'),
    createQ('Which HTTP header mitigates Cross-Site Scripting (XSS) by restricting where scripts, styles, and fonts can load from?', ['X-XSS-Protection', 'Content-Security-Policy (CSP)', 'Strict-Transport-Security (HSTS)', 'Access-Control-Allow-Methods'], 1, 'Content-Security-Policy restricts valid source origins for executable scripts and resources.', 'medium'),
    createQ('What is the primary trade-off when choosing MongoDB over a traditional relational database (PostgreSQL)?', ['MongoDB does not support integers', 'MongoDB provides flexible schema modeling and horizontal sharding, but requires careful schema design for ACID consistency across relations', 'Relational databases cannot store JSON data', 'MongoDB runs only on Windows servers'], 1, 'Document databases offer flexibility and horizontal scale, but complex transactional joins are more natural in relational RDBMS.', 'medium'),
    createQ('What does Docker layer caching mean during container builds?', ['Docker caches running containers on desktop screens', 'Docker reuses cached intermediate layers for instructions whose inputs have not changed, speeding up builds', 'Docker deletes old source code to save disk space', 'Docker encrypts application binaries'], 1, 'If a Dockerfile step and its context files remain unchanged, Docker reuses the existing cached image layer.', 'easy'),
    createQ('In REST API design, why is the PUT verb defined as idempotent while POST is not?', ['PUT requests cannot carry a request body', 'Calling PUT multiple times with the same payload produces the exact same server resource state as calling it once', 'POST requests are always encrypted', 'PUT requests are faster than POST'], 1, 'Idempotence guarantees that repeated identical requests leave the system in the exact same state.', 'medium'),
    createQ('Which of the following techniques protect Node.js microservices against Denial of Service (DoS) attacks? (Select all that apply)', ['Rate limiting and payload body size limits', 'Running long synchronous computational loops directly in request handlers', 'Implementing request timeouts on reverse proxies and servers', 'Using helmet to secure HTTP headers'], 0, 'Rate limiting, payload caps, connection timeouts, and security headers harden Node.js endpoints against DoS.', 'medium', true, [0, 2, 3]),
  ];

  const courseBS1Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: Enterprise NestJS Architecture & Modular Clean Code',
      type: 'text',
      order: 1,
      content: {
        text: 'Architecture patterns for enterprise backends: Controllers, Services, Custom Decorators, Global Validation Pipes, and Exception Filters. Managing multi-tenant environments and connection pooling.',
      },
      checkpoint: {
        questions: [
          createQ('Which NestJS component transforms and validates incoming client request payloads before reaching the controller handler?', ['Interceptors', 'Pipes', 'Guards', 'Gateways'], 1, 'Pipes validate and transform request payloads (e.g. ValidationPipe).'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Database Modeling, Indexing & Query Optimization',
      type: 'text',
      order: 2,
      content: {
        text: 'Analyzing MongoDB explain plans, compound indexing strategies (ESR rule: Equality, Sort, Range), and handling transactions with replica sets.',
      },
      checkpoint: {
        questions: [
          createQ('In the ESR indexing rule, what does the E stand for?', ['Encryption', 'Equality', 'Estimate', 'Export'], 1, 'ESR stands for Equality, Sort, Range order when building compound indexes.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Application Security, OWASP Top 10 & Containerization',
      type: 'text',
      order: 3,
      content: {
        text: 'Securing full-stack web applications: mitigating OWASP vulnerabilities (CSRF, XSS, SSRF), generating non-root Docker images, and managing environment secrets securely.',
      },
      checkpoint: {
        questions: [
          createQ('What security risk occurs when an application fetches a remote URL based on user input without validation?', ['Cross-Site Scripting (XSS)', 'Server-Side Request Forgery (SSRF)', 'SQL Injection', 'Clickjacking'], 1, 'SSRF occurs when an attacker tricks the server into making unauthorized requests to internal network services.'),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobBS1Id,
    employerId: employerBrainStation._id,
    companyName: 'Brain Station 23',
    title: 'Full Stack Engineer (Enterprise Digital Transformation)',
    description: `Brain Station 23 is partnering with leading international and local enterprises to build scalable cloud-native platforms.\n\nKey Responsibilities:\n• Develop resilient backend microservices with NestJS, Node.js, and MongoDB.\n• Build polished React & TypeScript frontends conforming to clean code guidelines.\n• Participate in code reviews, automated CI/CD releases, and container deployments.`,
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'REST APIs'],
    location: 'Dhaka, Bangladesh (Mohakhali DOHS)',
    salaryRange: { min: 100000, max: 160000, currency: 'BDT' },
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizBS1Id,
    courseId: courseBS1Id,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizBS1Id,
    jobId: jobBS1Id,
    employerId: employerBrainStation._id,
    passingScore: 70,
    timeLimit: 15,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizBS1Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: courseBS1Id,
    jobId: jobBS1Id,
    employerId: employerBrainStation._id,
    title: 'Scalable Enterprise Web Architecture & Security Standards',
    description: 'Curriculum focusing on NestJS IoC architecture, MongoDB ESR indexing rules, OWASP Top 10 defenses, and Docker container security.',
    modules: courseBS1Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ==========================================
  // EMPLOYER 3: Brain Station 23
  // Job 2: AI & Generative LLM Solutions Engineer
  // ==========================================
  const jobBS2Id = new mongoose.Types.ObjectId('660000000000000000000106');
  const quizBS2Id = new mongoose.Types.ObjectId('660000000000000000000206');
  const courseBS2Id = new mongoose.Types.ObjectId('660000000000000000000306');

  const quizBS2Questions = [
    createQ('What is Retrieval-Augmented Generation (RAG) primarily designed to resolve in Large Language Models?', ['Slow training speeds on GPUs', 'Hallucinations and outdated knowledge by fetching relevant context from an external vector index before inference', 'Audio file compression', 'Converting Python scripts to C++ code'], 1, 'RAG retrieves ground-truth documents from external knowledge bases and injects them into the prompt context.', 'easy'),
    createQ('Which distance metric is most commonly utilized to evaluate similarity between normalized dense vector embeddings?', ['Manhattan Distance', 'Cosine Similarity', 'Hamming Distance', 'Chebyshev Distance'], 1, 'Cosine similarity computes the cosine of the angle between two embedding vectors in multidimensional space.', 'easy'),
    createQ('Which of the following techniques reduce the memory footprint of LLMs during local or server inference? (Select all that apply)', ['4-bit / 8-bit Quantization (e.g. bitsandbytes, GGUF/AWQ)', 'Increasing the model parameter count from 7B to 70B', 'Key-Value (KV) cache compression and FlashAttention', 'Speculative decoding using a smaller draft model'], 0, 'Quantization, KV cache optimization, and speculative decoding decrease VRAM and latency.', 'hard', true, [0, 2, 3]),
    createQ('In LangChain, what is the role of an Agent with Tools?', ['It draws charts on web canvas', 'It uses LLM reasoning (such as ReAct) to dynamically determine which external tools to invoke and when to stop', 'It compiles Python code into native binaries', 'It resets the database server'], 1, 'Agents reason about user queries, selecting tools iteratively to fulfill complex objectives.', 'medium'),
    createQ('What is the main limitation of pure Cosine Similarity search over raw semantic embeddings?', ['It cannot run on Linux servers', 'It can miss exact keywords (e.g., product SKUs or acronyms) that BM25 keyword search catches easily', 'It requires an internet connection', 'It only works with English language'], 1, 'Hybrid search combining dense embeddings with sparse keyword search (BM25) overcomes semantic blindness to exact keywords.', 'medium'),
    createQ('What does Parameter-Efficient Fine-Tuning (PEFT / LoRA) do?', ['Freezes base model weights and trains small low-rank adapter matrices, drastically reducing GPU memory needs', 'Deletes 90% of model layers permanently', 'Increases training costs tenfold', 'Replaces all transformers with RNNs'], 0, 'LoRA injects trainable low-rank decomposition matrices while keeping pre-trained weights frozen.', 'medium'),
    createQ('What is the primary security vulnerability known as "Prompt Injection"?', ['Corrupting GPU memory registers via CUDA drivers', 'Manipulating an LLM behavior through untrusted user inputs designed to override system prompt constraints', 'Stealing electricity from data centers', 'Deleting database indexes through HTTP headers'], 1, 'Prompt injection bypasses safety guardrails and system rules by injecting hostile instructions into prompts.', 'medium'),
    createQ('In modern transformer architectures, what is the computational complexity of standard self-attention with respect to sequence length N?', ['O(1)', 'O(N)', 'O(N^2)', 'O(N!)'], 2, 'Full pairwise self-attention computes an N x N matrix, scaling quadratically with sequence length.', 'medium'),
    createQ('Which vector database index algorithm provides approximate nearest neighbor (ANN) search with high recall and logarithmic search time?', ['HNSW (Hierarchical Navigable Small World)', 'B-Tree', 'Sequential Array Scan', 'Linear Hash Ring'], 0, 'HNSW constructs multi-layered graphs for fast approximate nearest neighbor vector search.', 'hard'),
    createQ('Which of the following evaluation frameworks are commonly used to assess RAG pipeline answer quality? (Select all that apply)', ['Ragas (Faithfulness, Answer Relevance, Context Recall)', 'TruLens', 'A random dice roll', 'BLEU and ROUGE text overlap scores'], 0, 'Ragas, TruLens, and overlap benchmarks help evaluate retrieval precision and generation fidelity.', 'medium', true, [0, 1, 3]),
  ];

  const courseBS2Modules = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 1: Vector Embeddings, Chunking Strategies & HNSW Indexing',
      type: 'text',
      order: 1,
      content: {
        text: 'Document parsing, recursive character chunking, semantic chunking, and embedding generation using open-source models. Configuring HNSW and IVFFlat index parameters for sub-millisecond similarity queries.',
      },
      checkpoint: {
        questions: [
          createQ('Why is chunk overlap beneficial when splitting long documents for RAG systems?', ['It reduces document file size', 'It preserves semantic context across split boundaries so relevant information is not lost', 'It deletes duplicate words', 'It increases GPU clock speeds'], 1, 'Chunk overlap ensures that concepts spanning adjacent boundaries remain coherent.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 2: Advanced RAG: Hybrid Search, Reranking & Context Compression',
      type: 'text',
      order: 2,
      content: {
        text: 'Building hybrid pipelines combining dense vector similarity with BM25 sparse keyword indices. Implementing Cross-Encoder rerankers (Cohere, BGE-reranker) to elevate precision and filter irrelevant noise.',
      },
      checkpoint: {
        questions: [
          createQ('What does a Cross-Encoder Reranker do after initial vector retrieval?', ['Generates random numbers', 'Jointly scores query-passage pairs to reorder candidates based on deep contextual relevance', 'Translates passages to Latin', 'Deletes the vector database'], 1, 'Cross-encoders evaluate the query and document together, yielding higher accuracy than bi-encoders alone.'),
        ],
        minCorrect: 1,
      },
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Module 3: Fine-Tuning with LoRA & LLM Guardrails against Prompt Injection',
      type: 'text',
      order: 3,
      content: {
        text: 'Parameter-efficient fine-tuning (QLoRA) using Hugging Face PEFT. Implementing system prompt sanitization, NeMo Guardrails, and output validation to prevent prompt injection and unauthorized data leakage.',
      },
      checkpoint: {
        questions: [
          createQ('Which tool provides programmable boundary guardrails to constrain LLM conversations to specific domains?', ['NeMo Guardrails', 'Notepad', 'WinRAR', 'Gzip'], 0, 'NVIDIA NeMo Guardrails enforces dialogue flows and safety boundaries for LLM apps.'),
        ],
        minCorrect: 1,
      },
    },
  ];

  jobs.push({
    _id: jobBS2Id,
    employerId: employerBrainStation._id,
    companyName: 'Brain Station 23',
    title: 'AI & Generative LLM Solutions Engineer',
    description: `Lead generative AI adoption for enterprise clients by designing custom RAG pipelines, fine-tuning open-source LLMs, and building intelligent autonomous agents.\n\nKey Responsibilities:\n• Architect production RAG workflows combining vector search, BM25, and rerankers.\n• Fine-tune domain-specific models with QLoRA and evaluate retrieval accuracy.\n• Implement security guardrails against adversarial prompt injections and data leaks.`,
    requiredSkills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Vector Databases', 'LangChain'],
    location: 'Dhaka, Bangladesh (Remote / Hybrid)',
    salaryRange: { min: 130000, max: 200000, currency: 'BDT' },
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: quizBS2Id,
    courseId: courseBS2Id,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  quizzes.push({
    _id: quizBS2Id,
    jobId: jobBS2Id,
    employerId: employerBrainStation._id,
    passingScore: 70,
    timeLimit: 15,
    poolSize: 10,
    deliverCount: 10,
    shuffleOptions: true,
    questions: quizBS2Questions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  courses.push({
    _id: courseBS2Id,
    jobId: jobBS2Id,
    employerId: employerBrainStation._id,
    title: 'Prompt Engineering, RAG Systems & Model Fine-Tuning',
    description: 'In-depth enterprise curriculum on vector embeddings, hybrid retrieval, cross-encoder rerankers, QLoRA fine-tuning, and prompt injection security.',
    modules: courseBS2Modules,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { users, jobs, quizzes, courses };
}
