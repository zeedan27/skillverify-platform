import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Quiz, QuizResult, IntegrityEventType } from '@skillverify/shared';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  CheckSquare,
  CircleDot,
  ShieldAlert,
  Maximize2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoCard } from '../../components/ui/NeoCard';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const QuizPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | number[])[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);

  // Exam Gate & Anti-Cheat State
  const [hasStarted, setHasStarted] = useState(false);
  const [integrityCount, setIntegrityCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastIntegrityWarning, setLastIntegrityWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [jobId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/quiz/job/${jobId}`);
      const qData: Quiz = res.data.data;
      setQuiz(qData);

      // Initialize selected answers array
      const initialAnswers: (number | number[])[] = qData.questions.map((q) =>
        q.isMultiple ? [] : -1,
      );
      setSelectedAnswers(initialAnswers);

      const limitMinutes = qData.timeLimit || 15;
      setTimeLeft(limitMinutes * 60);
      setTotalTime(limitMinutes * 60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment for this circular.');
    } finally {
      setLoading(false);
    }
  };

  // Anti-cheating & Integrity listeners active once exam starts
  useEffect(() => {
    if (!quiz || result || !hasStarted) return;

    const logIntegrityEvent = async (type: IntegrityEventType, message: string) => {
      setIntegrityCount((prev) => {
        const next = prev + 1;
        setLastIntegrityWarning(`Warning #${next}: ${message}`);
        toast.warning(`Integrity Alert (#${next}): ${message}`);
        return next;
      });

      try {
        await api.post(`/quiz/integrity-event/${jobId}`, { type });
      } catch (err) {
        // Silent catch
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logIntegrityEvent(IntegrityEventType.TAB_SWITCH, 'Tab switch or window minimized detected.');
      }
    };

    const handleWindowBlur = () => {
      logIntegrityEvent(IntegrityEventType.WINDOW_BLUR, 'Window focus lost.');
    };

    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen) {
        logIntegrityEvent(IntegrityEventType.FULLSCREEN_EXIT, 'Fullscreen mode was exited.');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logIntegrityEvent(IntegrityEventType.COPY_PASTE, 'Copy / paste action intercepted and blocked.');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logIntegrityEvent(IntegrityEventType.CONTEXT_MENU, 'Context menu access blocked.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quiz, result, hasStarted, jobId]);

  // Countdown timer
  useEffect(() => {
    if (!hasStarted || timeLeft === null || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, result]);

  // Auto-submit when countdown hits zero
  useEffect(() => {
    if (hasStarted && timeLeft === 0 && !result && !submitting) {
      toast.error('Session time expired. Auto-submitting answers.');
      submitQuizAnswers(true);
    }
  }, [timeLeft, hasStarted, result, submitting]);

  const handleStartExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } catch (e) {
      // Fullscreen might be restricted by browser settings
    }

    setHasStarted(true);
    await api.post(`/quiz/start/${jobId}`).catch(() => {});
  };

  const handleSingleSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[questionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleMultiSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...selectedAnswers];
    const current = Array.isArray(updated[questionIndex])
      ? [...(updated[questionIndex] as number[])]
      : [];

    const existingPos = current.indexOf(optionIndex);
    if (existingPos > -1) {
      current.splice(existingPos, 1);
    } else {
      current.push(optionIndex);
    }
    current.sort((a, b) => a - b);
    updated[questionIndex] = current;
    setSelectedAnswers(updated);
  };

  const submitQuizAnswers = async (autoSubmitted = false) => {
    if (!quiz) return;

    if (!autoSubmitted) {
      const unanswered = selectedAnswers.filter((a) =>
        Array.isArray(a) ? a.length === 0 : a === -1,
      );
      if (unanswered.length > 0) {
        if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      const res = await api.post('/quiz/submit', {
        quizId: quiz._id,
        jobId,
        answers: selectedAnswers,
      });

      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Proctored Assessment...</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-red-50 rounded-base border-4 border-black dark:border-white shadow-neo text-center">
        <AlertTriangle className="w-10 h-10 mx-auto text-alert-red mb-3 stroke-[2.5px]" />
        <h2 className="text-xl font-black text-black dark:text-white">Assessment Error</h2>
        <p className="mt-2 text-xs font-bold text-black dark:text-white/70">{error}</p>
        <div className="mt-6">
          <NeoButton variant="primary" size="sm" onClick={() => navigate('/jobs')}>
            Browse Other Jobs
          </NeoButton>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. EXAM GATE (Pre-start Screen)
  // ─────────────────────────────────────────────────────────────
  if (!hasStarted && !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <NeoCard variant="stacked-yellow" padding="lg" borderWidth="4" shadowSize="lg" className="space-y-6 text-center">
          <div className="size-16 rounded-base bg-main border-3 border-black dark:border-white flex items-center justify-center mx-auto shadow-neo-sm -rotate-2">
            <Lock className="w-8 h-8 text-black dark:text-white stroke-[2.5px]" />
          </div>

          <div>
            <NeoBadge variant="black" slanted="-rotate-1" size="sm" className="mb-2">
              Secure Examination
            </NeoBadge>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-2">
              SkillGate Assessment Session
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/70 mt-2 max-w-md mx-auto leading-relaxed">
              You are about to start your verified skill assessment. Questions are delivered dynamically from the job's question pool.
            </p>
          </div>

          <div className="p-5 rounded-base bg-yellow-50 border-2 border-black dark:border-white text-left space-y-3 shadow-neo-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
              Integrity Protocol Rules
            </h4>
            <ul className="text-xs font-bold text-black dark:text-white/80 space-y-2">
              <li className="flex items-center gap-2.5">
                <Maximize2 className="w-4 h-4 text-black dark:text-white shrink-0 stroke-[2.5px]" />
                <span><strong className="text-black dark:text-white font-black">Fullscreen Mode:</strong> The assessment requests fullscreen focus.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-alert-red shrink-0 stroke-[2.5px]" />
                <span><strong className="text-black dark:text-white font-black">Integrity Logging:</strong> Tab switches, window blur, and copy/paste are logged advisory to employers.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-black dark:text-white shrink-0 stroke-[2.5px]" />
                <span><strong className="text-black dark:text-white font-black">Enforced Timer:</strong> Server timestamp limits session duration ({quiz.timeLimit || 15} minutes).</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-green-700 shrink-0 stroke-[2.5px]" />
                <span><strong className="text-black dark:text-white font-black">Randomized Pool:</strong> Evaluated against served questions only.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t-2 border-dashed border-black dark:border-white/20">
            <button
              onClick={() => navigate('/jobs')}
              className="w-full sm:w-auto px-6 py-3 rounded-base font-black text-xs text-black dark:text-white border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-slate-100 transition shadow-neo-sm"
            >
              Cancel & Exit
            </button>
            <NeoButton
              onClick={handleStartExam}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Maximize2 className="w-4 h-4 mr-2 stroke-[3px]" />
              <span>Enter Fullscreen & Begin</span>
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RESULT VIEW
  // ─────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <NeoCard
          variant={result.passed ? 'stacked-green' : 'stacked-red'}
          borderWidth="4"
          shadowSize="lg"
          padding="lg"
          className="space-y-6"
        >
          <div className="text-center space-y-3">
            {result.passed ? (
              <div className="size-16 rounded-full bg-success-mint border-3 border-black dark:border-white text-black dark:text-white flex items-center justify-center mx-auto shadow-neo-sm -rotate-3">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
              </div>
            ) : (
              <div className="size-16 rounded-full bg-alert-red border-3 border-black dark:border-white text-white dark:text-black flex items-center justify-center mx-auto shadow-neo-sm rotate-3">
                <XCircle className="w-10 h-10 stroke-[2.5px]" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
              {result.passed ? 'Skill Verified & Passed!' : 'Skill Threshold Not Met'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/70 max-w-md mx-auto">
              {result.passed
                ? 'Congratulations! You passed the gatekeeper assessment and qualified for the hiring pipeline.'
                : 'You did not achieve the required threshold. Complete the grooming course to unlock your final attempt.'}
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-yellow-50 rounded-base border-2 border-black dark:border-white shadow-neo-sm text-center">
            <div>
              <div className="text-xs text-black dark:text-white font-black uppercase">Your Score</div>
              <div className="text-3xl font-black text-black dark:text-white mt-0.5">{result.score}%</div>
            </div>
            <div>
              <div className="text-xs text-black dark:text-white font-black uppercase">Passing Score</div>
              <div className="text-3xl font-black text-black dark:text-white mt-0.5">{quiz.passingScore}%</div>
            </div>
            <div>
              <div className="text-xs text-black dark:text-white font-black uppercase">Status</div>
              <div
                className={`text-2xl sm:text-3xl font-black mt-0.5 ${
                  result.passed ? 'text-green-700' : 'text-alert-red'
                }`}
              >
                {result.passed ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Question Review (RULE-012) */}
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="space-y-4 pt-4 border-t-2 border-dashed border-black dark:border-white/20">
              <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
                Question Review & Rationale
              </h3>
              <div className="space-y-3">
                {result.breakdown.map((item, idx) => {
                  const q = quiz.questions[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-base border-2 border-black dark:border-white text-xs font-bold ${
                        item.isCorrect
                          ? 'bg-green-50 shadow-neo-sm'
                          : 'bg-red-50 shadow-neo-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-black text-black dark:text-white">
                          Question {idx + 1}: {q ? q.text : 'Assessment Item'}
                        </div>
                        {item.isCorrect ? (
                          <span className="text-[10px] font-black text-black dark:text-white bg-success-mint border border-black dark:border-white px-2 py-0.5 rounded shrink-0">
                            Correct
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-white dark:text-black bg-alert-red border border-black dark:border-white px-2 py-0.5 rounded shrink-0">
                            Incorrect
                          </span>
                        )}
                      </div>

                      {item.explanation && (
                        <div className="mt-2 text-black dark:text-white/80 bg-white dark:bg-zinc-900 p-3 rounded border-2 border-black dark:border-white font-medium">
                          <strong className="text-black dark:text-white font-black">Explanation: </strong>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t-2 border-dashed border-black dark:border-white/20">
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-black text-black dark:text-white hover:underline"
            >
              Browse Other Openings
            </button>
            <div className="flex items-center gap-3">
              {result.passed ? (
                <Link to={`/leaderboard/${jobId}`}>
                  <NeoButton variant="success" size="md">
                    <span>View Leaderboard Position</span>
                    <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
                  </NeoButton>
                </Link>
              ) : (
                <Link to={`/grooming/${jobId}`}>
                  <NeoButton variant="primary" size="md">
                    <span>Start Grooming Course</span>
                    <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
                  </NeoButton>
                </Link>
              )}
            </div>
          </div>
        </NeoCard>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ACTIVE EXAM VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Integrity Alert Banner */}
      {integrityCount > 0 && (
        <div className="mb-4 p-3.5 bg-red-100 border-2 border-black dark:border-white rounded-base flex items-center justify-between text-black dark:text-white text-xs font-black shadow-neo-sm animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-alert-red shrink-0 stroke-[2.5px]" />
            <span>{lastIntegrityWarning || `${integrityCount} integrity warning(s) logged during assessment.`}</span>
          </div>
          {!isFullscreen && (
            <button
              onClick={() => {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                  setIsFullscreen(true);
                }
              }}
              className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded border border-black dark:border-white text-[11px] font-black shrink-0 hover:bg-neutral-800"
            >
              Restore Fullscreen
            </button>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-8 border-4 border-black dark:border-white shadow-neo-lg space-y-6">
        {/* Sticky Header with Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-black dark:border-white/20">
          <div>
            <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-1">
              Gatekeeper Verification
            </NeoBadge>
            <h1 className="text-xl font-black text-black dark:text-white mt-1">Role Assessment</h1>
            <p className="text-xs font-bold text-black dark:text-white/60">
              Answer all {quiz.questions.length} questions. Questions marked with checkboxes allow multiple answers.
            </p>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-base border-2 border-black dark:border-white font-mono font-black text-xs sm:text-sm shadow-neo-sm ${
                timeLeft < 180
                  ? 'bg-alert-red text-white dark:text-black animate-pulse'
                  : 'bg-main text-black dark:text-white'
              }`}
            >
              <Clock className="w-4 h-4 stroke-[3px]" />
              <span>Time: {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border-2 border-black dark:border-white text-black dark:text-white text-xs rounded-base font-bold">
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {quiz.questions.map((question, qIdx) => {
            const isMulti = Boolean(question.isMultiple);
            const userAns = selectedAnswers[qIdx];

            return (
              <div key={qIdx} className="p-5 rounded-base border-2 border-black dark:border-white bg-slate-50 space-y-3 shadow-neo-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black dark:text-white uppercase">
                      Question {qIdx + 1} of {quiz.questions.length}
                    </span>
                    {question.difficulty && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border border-black dark:border-white uppercase tracking-wider ${
                          question.difficulty === 'hard'
                            ? 'bg-red-200 text-black dark:text-white'
                            : question.difficulty === 'medium'
                            ? 'bg-yellow-200 text-black dark:text-white'
                            : 'bg-green-200 text-black dark:text-white'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white">
                    {isMulti ? 'Multiple Answers' : 'Single Answer'}
                  </span>
                </div>

                <h3 className="text-sm font-black text-black dark:text-white leading-snug">{question.text}</h3>

                <div className="space-y-2 pt-1">
                  {question.options.map((opt, optIdx) => {
                    const isSelected = isMulti
                      ? Array.isArray(userAns) && userAns.includes(optIdx)
                      : userAns === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() =>
                          isMulti ? handleMultiSelect(qIdx, optIdx) : handleSingleSelect(qIdx, optIdx)
                        }
                        className={`flex items-center gap-3 p-3.5 rounded-base border-2 border-black dark:border-white transition cursor-pointer select-none font-bold text-xs ${
                          isSelected
                            ? 'bg-main text-black dark:text-white shadow-neo-sm translate-x-1'
                            : 'bg-white dark:bg-zinc-900 hover:bg-yellow-50 text-black dark:text-white shadow-neo-sm hover:translate-x-[1px]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 border-black dark:border-white ${
                            isSelected ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-transparent'
                          }`}
                        >
                          {isMulti ? (
                            <CheckSquare className="w-3.5 h-3.5 stroke-[3px]" />
                          ) : (
                            <CircleDot className="w-3.5 h-3.5 stroke-[3px]" />
                          )}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t-2 border-dashed border-black dark:border-white/20">
          <span className="text-xs font-bold text-black dark:text-white/60">
            Answered{' '}
            <strong className="text-black dark:text-white font-black">
              {
                selectedAnswers.filter((a) => (Array.isArray(a) ? a.length > 0 : a !== -1))
                  .length
              }
            </strong>{' '}
            of {quiz.questions.length} questions
          </span>
          <NeoButton
            type="button"
            disabled={submitting}
            onClick={() => submitQuizAnswers(false)}
            variant="primary"
            size="md"
          >
            {submitting ? 'Evaluating Assessment...' : 'Submit Answers'}
          </NeoButton>
        </div>
      </div>
    </div>
  );
};
