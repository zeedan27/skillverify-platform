import React, { useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Bot, AlertCircle, Check, X, Loader2, ArrowRight } from 'lucide-react';
import { GeneratedQuizResponse, QuizQuestion } from '@skillverify/shared';
import { NeoButton } from '../ui/NeoButton';
import { NeoBadge } from '../ui/NeoBadge';

interface Props {
  jobId: string;
  onClose: () => void;
  onImport: (questions: Omit<QuizQuestion, '_id'>[], mode: 'replace' | 'append') => void;
}

export const AiQuizGeneratorModal: React.FC<Props> = ({
  jobId,
  onClose,
  onImport,
}) => {
  const toast = useToast();
  const [count, setCount] = useState<number>(10);
  const [multiRatio, setMultiRatio] = useState<number>(0.2); // 20%
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedQuizResponse | null>(null);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setResult(null);

      const res = await api.post('/ai/generate-quiz', {
        jobId,
        count: Number(count),
        multiRatio: Number(multiRatio),
      });

      setResult(res.data.data);
      toast.success(res.data.message || 'Questions generated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-neo-lg border-3 border-black dark:border-white animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b-2 border-black dark:border-white flex items-center justify-between bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black dark:border-white flex items-center justify-center shadow-neo">
              <Sparkles className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-black dark:text-white">AI Assessment Generator</h3>
                <NeoBadge variant="yellow" size="sm" className="font-mono">
                  DUAL-ENGINE
                </NeoBadge>
              </div>
              <p className="text-xs font-bold text-slate-600">
                Powered by Gemma 4 (Cloud Engine) & Llama 3 (Local Fallback)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-slate-100 shadow-neo transition text-black dark:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {!result ? (
            <div className="space-y-6">
              {/* Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                    Question Count (Pool: 10–20)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Math.min(20, Math.max(10, Number(e.target.value))))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                  />
                  <p className="text-[11px] font-bold text-slate-500 mt-1">
                    RULE-008: Assessment pools must contain 10 to 20 questions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                    Multi-Choice Question Mix
                  </label>
                  <select
                    value={multiRatio}
                    onChange={(e) => setMultiRatio(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                  >
                    <option value={0}>0% Multi-choice (All Single Answer)</option>
                    <option value={0.2}>20% Multi-choice (Recommended)</option>
                    <option value={0.3}>30% Multi-choice</option>
                    <option value={0.5}>50% Multi-choice</option>
                  </select>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">
                    Allows candidates to select all applicable correct options.
                  </p>
                </div>
              </div>

              {/* Hardware Optimization Advisory */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-black dark:border-white shadow-neo flex items-start gap-3">
                <Bot className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-black text-black dark:text-white uppercase tracking-wider">
                    Hardware-Optimized Dual Engine Pipeline
                  </p>
                  <p className="leading-relaxed font-medium">
                    Generation uses <strong>gemma4:31b-cloud</strong> as the primary cloud engine to eliminate local CPU latency on laptop hardware. If offline, the pipeline automatically falls back to micro-chunked local <strong>llama3:latest</strong> or verified technical templates.
                  </p>
                </div>
              </div>

              {/* Constitutional Notice RULE-024 */}
              <div className="p-4 bg-amber-100 rounded-xl border-2 border-black dark:border-white shadow-neo flex items-start gap-3 text-xs text-amber-950">
                <AlertCircle className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-black uppercase tracking-wider">Constitutional Rule RULE-024 Notice:</p>
                  <p className="font-medium leading-relaxed">
                    AI-generated quiz questions are saved as unattached drafts. You must review the questions, verify the answer keys, and explicitly confirm attachment before the quiz goes live.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Generation Result Summary */}
              <div className="flex items-center justify-between p-4 bg-neo-mint rounded-xl border-2 border-black dark:border-white shadow-neo">
                <div className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-black dark:text-white" />
                  <div>
                    <h4 className="text-xs font-black text-black dark:text-white uppercase">
                      Generated {result.questions.length} Assessment Questions
                    </h4>
                    <span className="text-[11px] text-black dark:text-white font-bold">
                      Engine Source: <code className="font-mono bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-black dark:border-white">{result.source}</code>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs font-black uppercase text-black dark:text-white hover:underline"
                >
                  Regenerate
                </button>
              </div>

              {/* Warnings / RULE-024 */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-3 bg-amber-100 rounded-xl border-2 border-black dark:border-white text-[11px] text-amber-950 space-y-1 font-bold">
                  {result.warnings.map((w, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <span>•</span> {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview of Questions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Questions Draft Preview
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {result.questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border-2 border-black dark:border-white shadow-sm space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-black dark:text-white">
                          {idx + 1}. {q.text}
                        </span>
                        <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded border border-black dark:border-white bg-neo-yellow text-black dark:text-white uppercase">
                          {q.isMultiple ? 'Multi' : 'Single'} • {q.difficulty}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.isMultiple
                            ? q.correctIndices?.includes(oIdx)
                            : q.correctIndex === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border-2 border-black dark:border-white ${
                                isCorrect
                                  ? 'bg-neo-mint font-bold'
                                  : 'bg-[#FFFDF5]'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}) {opt}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <p className="text-[10px] text-slate-500 italic">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black uppercase text-slate-500 hover:text-black dark:text-white transition"
          >
            Cancel
          </button>

          {!result ? (
            <NeoButton
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              variant="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                  <span>Synthesizing Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black dark:text-white" />
                  <span>Generate Questions</span>
                </>
              )}
            </NeoButton>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onImport(result.questions, 'append');
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white font-black text-xs uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
              >
                Append to Pool
              </button>
              <NeoButton
                type="button"
                onClick={() => {
                  onImport(result.questions, 'replace');
                  onClose();
                }}
                variant="primary"
                size="sm"
                className="inline-flex items-center gap-1.5"
              >
                <span>Import & Review (RULE-024)</span>
                <ArrowRight className="w-4 h-4" />
              </NeoButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
