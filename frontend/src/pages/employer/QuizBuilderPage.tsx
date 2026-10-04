import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  CheckSquare,
  CircleDot,
  Shuffle,
  ShieldCheck,
  Layers,
  Sparkles,
  Loader2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { AiQuizGeneratorModal } from '../../components/quiz/AiQuizGeneratorModal';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';

interface LocalQuestion {
  text: string;
  options: string[];
  isMultiple: boolean;
  correctIndex: number;
  correctIndices: number[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const QuizBuilderPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const defaultQuestions: LocalQuestion[] = Array.from({ length: 10 }).map((_, i) => {
    const isMulti = i === 2 || i === 7;
    return {
      text: isMulti
        ? `Technical Multi-Select Assessment #${i + 1}: Select all correct principles that apply.`
        : `Technical Single-Choice Assessment #${i + 1}: Select the primary optimal approach.`,
      options: [
        `Option A for Question ${i + 1}`,
        `Option B for Question ${i + 1}`,
        `Option C for Question ${i + 1}`,
        `Option D for Question ${i + 1}`,
      ],
      isMultiple: isMulti,
      correctIndex: 0,
      correctIndices: isMulti ? [0, 2] : [0],
      explanation: `Competency verification explanation for Question ${i + 1}.`,
      difficulty: (i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard',
    };
  });

  const [questions, setQuestions] = useState<LocalQuestion[]>(defaultQuestions);
  const [timeLimit, setTimeLimit] = useState(15);
  const [deliverCount, setDeliverCount] = useState<number>(10);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    loadExistingQuiz();
  }, [jobId]);

  const loadExistingQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quiz/job/${jobId}`);
      const quiz = res.data.data;
      if (quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        setIsEditingExisting(true);
        if (quiz.timeLimit !== undefined) {
          setTimeLimit(quiz.timeLimit);
        }
        if (quiz.deliverCount !== undefined) {
          setDeliverCount(quiz.deliverCount);
        }
        if (quiz.shuffleOptions !== undefined) {
          setShuffleOptions(Boolean(quiz.shuffleOptions));
        }

        const loaded: LocalQuestion[] = quiz.questions.map((q: any) => {
          const isMultiple = Boolean(
            q.isMultiple || (Array.isArray(q.correctIndices) && q.correctIndices.length > 1),
          );
          let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
          let correctIndices =
            Array.isArray(q.correctIndices) && q.correctIndices.length > 0
              ? q.correctIndices
              : [correctIndex];

          return {
            text: q.text || '',
            options:
              Array.isArray(q.options) && q.options.length === 4
                ? q.options
                : ['Option A', 'Option B', 'Option C', 'Option D'],
            isMultiple,
            correctIndex,
            correctIndices,
            explanation: q.explanation || '',
            difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
          };
        });

        setQuestions(loaded);
      }
    } catch {
      setIsEditingExisting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAiImport = (importedQuestions: any[], mode: 'replace' | 'append') => {
    const formatted: LocalQuestion[] = importedQuestions.map((q) => ({
      text: q.text,
      options: q.options,
      isMultiple: !!q.isMultiple,
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [0],
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
    }));

    if (mode === 'replace') {
      setQuestions(formatted);
      setDeliverCount(Math.min(20, Math.max(10, formatted.length)));
      toast.success(`Imported ${formatted.length} AI draft questions for review!`);
    } else {
      const combined = [...questions, ...formatted].slice(0, 40);
      setQuestions(combined);
      setDeliverCount(Math.min(20, Math.max(10, combined.length)));
      toast.success(`Appended questions (Total pool: ${combined.length})!`);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 40) {
      toast.error('RULE-017: A question pool cannot exceed 40 questions.');
      return;
    }
    const newLength = questions.length + 1;
    setQuestions([
      ...questions,
      {
        text: `Technical Assessment Question #${newLength}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        isMultiple: false,
        correctIndex: 0,
        correctIndices: [0],
        explanation: '',
        difficulty: 'medium',
      },
    ]);
    if (deliverCount < 10) {
      setDeliverCount(10);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 10) {
      toast.error('RULE-008: A quiz pool must have at least 10 questions.');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (deliverCount > newQuestions.length) {
      setDeliverCount(Math.max(10, Math.min(20, newQuestions.length)));
    }
  };

  const toggleQuestionType = (qIndex: number, isMultiple: boolean) => {
    const updated = [...questions];
    const q = updated[qIndex];
    q.isMultiple = isMultiple;
    if (isMultiple) {
      if (!q.correctIndices || q.correctIndices.length === 0) {
        q.correctIndices = [q.correctIndex ?? 0];
      }
    } else {
      q.correctIndex = q.correctIndices.length > 0 ? q.correctIndices[0] : 0;
      q.correctIndices = [q.correctIndex];
    }
    setQuestions(updated);
  };

  const updateDifficulty = (qIndex: number, difficulty: 'easy' | 'medium' | 'hard') => {
    const updated = [...questions];
    updated[qIndex].difficulty = difficulty;
    setQuestions(updated);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateExplanationText = (index: number, explanation: string) => {
    const updated = [...questions];
    updated[index].explanation = explanation;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const setSingleCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = optIndex;
    updated[qIndex].correctIndices = [optIndex];
    setQuestions(updated);
  };

  const toggleMultiCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const current = [...(updated[qIndex].correctIndices || [])];
    const idx = current.indexOf(optIndex);
    if (idx > -1) {
      if (current.length === 1) {
        toast.warning('Multi-choice questions must have at least one correct option selected.');
        return;
      }
      current.splice(idx, 1);
    } else {
      current.push(optIndex);
    }
    current.sort((a, b) => a - b);
    updated[qIndex].correctIndices = current;
    updated[qIndex].correctIndex = current[0];
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length < 10 || questions.length > 40) {
      setError('RULE-008 & RULE-017: Question pool must be between 10 and 40 questions.');
      return;
    }

    if (deliverCount < 10 || deliverCount > 20) {
      setError('RULE-017: Questions delivered to applicant must be between 10 and 20.');
      return;
    }

    if (questions.length < deliverCount) {
      setError('Pool size cannot be smaller than deliver count.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.isMultiple && (!q.correctIndices || q.correctIndices.length === 0)) {
        setError(`Question #${i + 1} has no correct options selected.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      const payloadQuestions = questions.map((q) => ({
        text: q.text,
        options: q.options,
        isMultiple: q.isMultiple,
        correctIndex: q.isMultiple ? q.correctIndices[0] : q.correctIndex,
        correctIndices: q.correctIndices,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }));

      await api.post('/quiz', {
        jobId,
        questions: payloadQuestions,
        timeLimit: Number(timeLimit),
        poolSize: questions.length,
        deliverCount: Number(deliverCount),
        shuffleOptions: Boolean(shuffleOptions),
      });

      toast.success(
        isEditingExisting
          ? 'Skill assessment updated successfully!'
          : 'Skill assessment created with anti-cheat configuration!',
      );
      navigate(`/employer/jobs/${jobId}/course`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern flex justify-center items-center">
        <div className="p-8 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-black dark:text-white animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
            Loading Assessment Configuration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/employer/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="pb-6 border-b-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <NeoBadge variant="yellow" size="sm" className="font-mono">
                  ASSESSMENT ENGINE
                </NeoBadge>
                {isEditingExisting && (
                  <NeoBadge variant="green" size="sm">
                    ACTIVE POOL
                  </NeoBadge>
                )}
                <span className="text-[10px] font-black uppercase text-slate-500 font-mono">
                  Step 2 of 3: Question Pool
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                Quiz & Pool Builder
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Construct 10–40 pool questions. The server serves a randomized subset (10–20) with shuffled options to eliminate cheating (RULE-017).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-neo-yellow text-black dark:text-white font-black text-xs uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate via AI</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo">
                <Clock className="w-4 h-4 text-black dark:text-white" />
                <label className="text-xs font-black uppercase text-black dark:text-white">Time Limit:</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-14 px-1.5 py-0.5 rounded border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-black text-center"
                />
                <span className="text-[11px] font-bold text-slate-600">min</span>
              </div>
            </div>
          </div>

          {/* Anti-Cheat & Delivery Bar */}
          <div className="p-4 rounded-xl border-2 border-black dark:border-white bg-neo-mint/30 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black dark:text-white" />
                <label className="text-xs font-black uppercase text-black dark:text-white">Delivered Subset:</label>
                <input
                  type="number"
                  value={deliverCount}
                  onChange={(e) =>
                    setDeliverCount(Math.min(questions.length, Math.max(10, Number(e.target.value))))
                  }
                  min={10}
                  max={Math.min(20, questions.length)}
                  className="w-14 px-2 py-1 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-black text-center"
                />
                <span className="text-[11px] font-bold text-slate-700">(10–20 subset)</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black dark:border-white text-black dark:text-white focus:ring-0"
                />
                <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-black dark:text-white" />
                  Shuffle Options Order
                </span>
              </label>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-[11px] font-black uppercase text-black dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Cheat Guard Active</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-black dark:border-white shadow-neo text-red-900 text-xs font-bold rounded-xl flex items-center gap-2.5">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Pool Questions:
                </span>
                <NeoBadge variant="purple" size="sm" className="font-mono">
                  {questions.length} / 40 (Min: 10)
                </NeoBadge>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= 40}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-black dark:text-white font-black text-xs uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="p-5 rounded-2xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white px-2.5 py-1 rounded-lg bg-neo-yellow border-2 border-black dark:border-white font-mono">
                        Q{qIndex + 1}
                      </span>

                      {/* Question Type Toggle */}
                      <div className="inline-flex rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-0.5 shadow-sm text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => toggleQuestionType(qIndex, false)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-black uppercase transition ${
                            !q.isMultiple
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'text-black dark:text-white hover:bg-slate-100'
                          }`}
                        >
                          <CircleDot className="w-3 h-3" />
                          <span>Single Choice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleQuestionType(qIndex, true)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-black uppercase transition ${
                            q.isMultiple
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'text-black dark:text-white hover:bg-slate-100'
                          }`}
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Multi-Choice</span>
                        </button>
                      </div>

                      {/* Difficulty */}
                      <select
                        value={q.difficulty}
                        onChange={(e) => updateDifficulty(qIndex, e.target.value as any)}
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg border-2 border-black dark:border-white uppercase tracking-wider ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-900'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    {questions.length > 10 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1.5 rounded-lg border-2 border-black dark:border-white bg-red-100 hover:bg-red-200 text-red-900 transition self-end sm:self-auto"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    placeholder="Formulate technical question prompt..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                    required
                  />

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => {
                      const isChecked = q.isMultiple
                        ? q.correctIndices?.includes(optIndex)
                        : q.correctIndex === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 border-black dark:border-white transition ${
                            isChecked ? 'bg-neo-mint shadow-neo' : 'bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              q.isMultiple
                                ? toggleMultiCorrect(qIndex, optIndex)
                                : setSingleCorrect(qIndex, optIndex)
                            }
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 border-black dark:border-white transition font-mono text-xs font-black ${
                              isChecked ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-black dark:text-white'
                            }`}
                          >
                            {isChecked ? <CheckCircle2 className="w-4 h-4" /> : String.fromCharCode(65 + optIndex)}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOptionText(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            className="w-full text-xs font-bold text-black dark:text-white focus:outline-none bg-transparent"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                      Technical Explanation (Disclosed after candidate passes or final attempt):
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => updateExplanationText(qIndex, e.target.value)}
                      placeholder="Provide reasoning and rationale explaining correct answers..."
                      className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-black dark:border-white">
              <button
                type="button"
                onClick={() => navigate('/employer/dashboard')}
                className="text-xs font-black uppercase text-slate-500 hover:text-black dark:text-white transition"
              >
                Cancel
              </button>
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? 'Saving Pool...'
                  : isEditingExisting
                  ? 'Update Assessment & Next →'
                  : 'Lock Assessment & Build Curriculum →'}
              </NeoButton>
            </div>
          </form>
        </div>

        {showAiModal && jobId && (
          <AiQuizGeneratorModal
            jobId={jobId}
            onClose={() => setShowAiModal(false)}
            onImport={handleAiImport}
          />
        )}
      </div>
    </div>
  );
};
