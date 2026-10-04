import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { CourseModuleType } from '@skillverify/shared';
import {
  Plus,
  Trash2,
  Video,
  FileText,
  ArrowLeft,
  Paperclip,
  CheckSquare,
  HelpCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';

interface CheckpointQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LocalModule {
  title: string;
  type: CourseModuleType;
  order: number;
  content: {
    text?: string;
    fileUrl?: string;
    fileName?: string;
    durationSeconds?: number;
  };
  hasCheckpoint?: boolean;
  checkpoint?: {
    questions: CheckpointQuestion[];
    minCorrect: number;
  };
}

export const CourseCreatorPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('Essential Grooming & Skill Preparation Course');
  const [description, setDescription] = useState(
    'Mandatory learning curriculum for applicants aiming to earn their second and final attempt.',
  );
  const [modules, setModules] = useState<LocalModule[]>([
    {
      title: 'Module 1: Architecture Fundamentals & Best Practices',
      type: CourseModuleType.TEXT,
      order: 1,
      content: {
        text: 'Core principles of modern reactive UI architecture, state isolation, and performant asynchronous pipelines.\n\nKey Concepts:\n1. Unidirectional Data Flow\n2. Optimistic UI Updates\n3. Error boundaries and defensive API consumption.',
      },
      hasCheckpoint: true,
      checkpoint: {
        minCorrect: 1,
        questions: [
          {
            text: 'What is the primary benefit of unidirectional data flow in component architecture?',
            options: [
              'Predictable state mutations and easier debugging',
              'Faster network request roundtrips',
              'Elimination of database queries',
              'Automatic CSS styling generation',
            ],
            correctIndex: 0,
            explanation: 'Unidirectional data flow ensures state transitions occur predictably in a single direction.',
          },
        ],
      },
    },
    {
      title: 'Module 2: Technical Deep Dive Video Session',
      type: CourseModuleType.VIDEO,
      order: 2,
      content: {
        text: 'Review the technical architecture walkthrough video before proceeding.',
        fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      hasCheckpoint: false,
    },
    {
      title: 'Module 3: Official Engineering Handbook & Study Sheet',
      type: CourseModuleType.FILE,
      order: 3,
      content: {
        text: 'Download the comprehensive engineering handbook and system architecture diagram.',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'engineering_spec_handbook.pdf',
      },
      hasCheckpoint: false,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    loadExistingCourse();
  }, [jobId]);

  const loadExistingCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/job/${jobId}`);
      const course = res.data.data;
      if (course) {
        setIsEditingExisting(true);
        if (course.title) setTitle(course.title);
        if (course.description) setDescription(course.description);
        if (Array.isArray(course.modules) && course.modules.length > 0) {
          setModules(
            course.modules.map((m: any, idx: number) => ({
              title: m.title || `Module ${idx + 1}`,
              type: m.type || CourseModuleType.TEXT,
              order: m.order || idx + 1,
              content: {
                text: m.content?.text || '',
                fileUrl: m.content?.fileUrl || '',
                fileName: m.content?.fileName || '',
                durationSeconds: m.content?.durationSeconds,
              },
              hasCheckpoint: !!m.checkpoint,
              checkpoint: m.checkpoint
                ? {
                    questions: m.checkpoint.questions || [],
                    minCorrect: m.checkpoint.minCorrect || 1,
                  }
                : undefined,
            })),
          );
        }
      }
    } catch {
      setIsEditingExisting(false);
    } finally {
      setLoading(false);
    }
  };

  const addModule = (type: CourseModuleType) => {
    setModules([
      ...modules,
      {
        title: `Module ${modules.length + 1}: ${
          type === CourseModuleType.TEXT
            ? 'Text Lesson'
            : type === CourseModuleType.VIDEO
            ? 'Video Lecture'
            : 'Downloadable Guide'
        }`,
        type,
        order: modules.length + 1,
        content: {
          text: '',
          fileUrl: '',
          fileName: type === CourseModuleType.FILE ? 'study_guide.pdf' : undefined,
        },
        hasCheckpoint: false,
      },
    ]);
  };

  const removeModule = (index: number) => {
    if (modules.length <= 1) {
      toast.warning('A course must contain at least one module.');
      return;
    }
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModuleTitle = (index: number, val: string) => {
    const updated = [...modules];
    updated[index].title = val;
    setModules(updated);
  };

  const updateModuleText = (index: number, val: string) => {
    const updated = [...modules];
    updated[index].content.text = val;
    setModules(updated);
  };

  const updateModuleFileUrl = (index: number, val: string) => {
    const updated = [...modules];
    updated[index].content.fileUrl = val;
    setModules(updated);
  };

  const updateModuleFileName = (index: number, val: string) => {
    const updated = [...modules];
    updated[index].content.fileName = val;
    setModules(updated);
  };

  const toggleCheckpoint = (index: number) => {
    const updated = [...modules];
    const mod = updated[index];
    mod.hasCheckpoint = !mod.hasCheckpoint;
    if (mod.hasCheckpoint && (!mod.checkpoint || mod.checkpoint.questions.length === 0)) {
      mod.checkpoint = {
        minCorrect: 1,
        questions: [
          {
            text: `Checkpoint verification question for ${mod.title}`,
            options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'Verify understanding of key module principles before unlocking.',
          },
        ],
      };
    }
    setModules(updated);
  };

  const updateCheckpointQuestionText = (mIdx: number, qIdx: number, text: string) => {
    const updated = [...modules];
    if (updated[mIdx].checkpoint?.questions[qIdx]) {
      updated[mIdx].checkpoint!.questions[qIdx].text = text;
      setModules(updated);
    }
  };

  const updateCheckpointOption = (mIdx: number, qIdx: number, optIdx: number, text: string) => {
    const updated = [...modules];
    if (updated[mIdx].checkpoint?.questions[qIdx]) {
      updated[mIdx].checkpoint!.questions[qIdx].options[optIdx] = text;
      setModules(updated);
    }
  };

  const setCheckpointCorrectIndex = (mIdx: number, qIdx: number, optIdx: number) => {
    const updated = [...modules];
    if (updated[mIdx].checkpoint?.questions[qIdx]) {
      updated[mIdx].checkpoint!.questions[qIdx].correctIndex = optIdx;
      setModules(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modules.length === 0) {
      setError('Please add at least one module.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payloadModules = modules.map((m, idx) => ({
        title: m.title,
        type: m.type,
        order: idx + 1,
        content: m.content,
        checkpoint:
          m.hasCheckpoint && m.checkpoint && m.checkpoint.questions.length > 0
            ? {
                questions: m.checkpoint.questions.map((q) => ({
                  text: q.text,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  explanation: q.explanation,
                })),
                minCorrect: m.checkpoint.minCorrect || 1,
              }
            : undefined,
      }));

      await api.post('/courses', {
        jobId,
        title,
        description,
        modules: payloadModules,
      });

      toast.success(
        isEditingExisting
          ? 'Grooming course updated successfully!'
          : 'Grooming course published with checkpoint micro-quizzes!',
      );
      navigate(`/employer/jobs/${jobId}/leaderboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save course');
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
            Loading Course Curriculum...
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
                  REMEDIATION CURRICULUM
                </NeoBadge>
                {isEditingExisting && (
                  <NeoBadge variant="green" size="sm">
                    COURSE ACTIVE
                  </NeoBadge>
                )}
                <span className="text-[10px] font-black uppercase text-slate-500 font-mono">
                  Step 3 of 3: Grooming Modules
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                Course & Micro-Checkpoint Creator
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Construct remediation study modules. Candidates who fail attempt 1 must complete this course and pass all checkpoint micro-quizzes to unlock their final attempt (RULE-003 & RULE-019).
              </p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-neo-yellow border-2 border-black dark:border-white items-center justify-center shadow-neo">
              <BookOpen className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-black dark:border-white shadow-neo text-red-900 text-xs font-bold rounded-xl flex items-center gap-2.5">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-black text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Curriculum Overview & Objectives
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-medium text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black dark:border-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Curriculum Modules ({modules.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addModule(CourseModuleType.TEXT)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase text-black dark:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addModule(CourseModuleType.VIDEO)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase text-black dark:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>+ Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addModule(CourseModuleType.FILE)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase text-black dark:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>+ Guide</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black">
                          #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded border-2 border-black dark:border-white bg-neo-yellow text-[10px] font-black uppercase text-black dark:text-white">
                          {mod.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeModule(idx)}
                        className="p-1 rounded-lg border-2 border-black dark:border-white bg-red-100 hover:bg-red-200 text-red-900 transition"
                        title="Remove module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                        Module Title
                      </label>
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => updateModuleTitle(idx, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none"
                        required
                      />
                    </div>

                    {mod.type === CourseModuleType.TEXT && (
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Lesson Text Content
                        </label>
                        <textarea
                          value={mod.content.text || ''}
                          onChange={(e) => updateModuleText(idx, e.target.value)}
                          rows={4}
                          placeholder="Comprehensive engineering guide and code snippets..."
                          className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    {mod.type === CourseModuleType.VIDEO && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Video Lecture URL (YouTube or MP4 Direct Link)
                          </label>
                          <input
                            type="url"
                            value={mod.content.fileUrl || ''}
                            onChange={(e) => updateModuleFileUrl(idx, e.target.value)}
                            placeholder="e.g. https://www.youtube.com/watch?v=..."
                            className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Video Summary / Key Takeaways
                          </label>
                          <textarea
                            value={mod.content.text || ''}
                            onChange={(e) => updateModuleText(idx, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {mod.type === CourseModuleType.FILE && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                              Download URL
                            </label>
                            <input
                              type="url"
                              value={mod.content.fileUrl || ''}
                              onChange={(e) => updateModuleFileUrl(idx, e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                              Display Filename
                            </label>
                            <input
                              type="text"
                              value={mod.content.fileName || ''}
                              onChange={(e) => updateModuleFileName(idx, e.target.value)}
                              placeholder="system_spec.pdf"
                              className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Candidate Study Instructions
                          </label>
                          <textarea
                            value={mod.content.text || ''}
                            onChange={(e) => updateModuleText(idx, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-medium text-black dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Micro-Checkpoint Quiz Toggle (RULE-019) */}
                    <div className="pt-3 border-t-2 border-black dark:border-white/20">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={mod.hasCheckpoint || false}
                            onChange={() => toggleCheckpoint(idx)}
                            className="w-4 h-4 rounded border-2 border-black dark:border-white text-black dark:text-white focus:ring-0"
                          />
                          <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-black dark:text-white" />
                            <span>Attach Micro-Checkpoint Quiz (RULE-019)</span>
                          </span>
                        </label>
                        {mod.hasCheckpoint && (
                          <span className="text-[10px] font-black text-black dark:text-white bg-neo-mint border-2 border-black dark:border-white px-2 py-0.5 rounded shadow-sm">
                            Required to complete module
                          </span>
                        )}
                      </div>

                      {mod.hasCheckpoint && mod.checkpoint && (
                        <div className="mt-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-neo space-y-3">
                          {mod.checkpoint.questions.map((cq, cqIdx) => (
                            <div key={cqIdx} className="space-y-2">
                              <label className="block text-[10px] font-black uppercase text-slate-500">
                                Verification Micro-Question #{cqIdx + 1}
                              </label>
                              <input
                                type="text"
                                value={cq.text}
                                onChange={(e) => updateCheckpointQuestionText(idx, cqIdx, e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border-2 border-black dark:border-white text-xs font-bold text-black dark:text-white"
                                placeholder="Verification question prompt..."
                                required
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {cq.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-2 p-2 rounded-lg border-2 border-black dark:border-white transition ${
                                      cq.correctIndex === optIdx
                                        ? 'bg-neo-mint font-bold'
                                        : 'bg-[#FFFDF5]'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`checkpoint-${idx}-${cqIdx}`}
                                      checked={cq.correctIndex === optIdx}
                                      onChange={() => setCheckpointCorrectIndex(idx, cqIdx, optIdx)}
                                      className="text-black dark:text-white focus:ring-0"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateCheckpointOption(idx, cqIdx, optIdx, e.target.value)}
                                      className="w-full text-xs font-semibold bg-transparent focus:outline-none"
                                      placeholder={`Option ${optIdx + 1}`}
                                      required
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  ? isEditingExisting
                    ? 'Updating...'
                    : 'Publishing...'
                  : isEditingExisting
                  ? 'Update Grooming Course →'
                  : 'Publish Course & Complete Setup →'}
              </NeoButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
