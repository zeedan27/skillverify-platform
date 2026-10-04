import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Course, CourseProgress, CourseModuleType } from '@skillverify/shared';
import {
  BookOpen,
  CheckCircle,
  Play,
  FileText,
  ArrowRight,
  ShieldAlert,
  Download,
  Paperclip,
  ExternalLink,
  CheckSquare,
  CircleDot,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const GroomingPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number[]>>({});

  useEffect(() => {
    loadCourseAndProgress();
  }, [jobId]);

  const loadCourseAndProgress = async () => {
    try {
      setLoading(true);
      const courseRes = await api.get(`/courses/job/${jobId}`);
      const courseData: Course = courseRes.data.data;
      setCourse(courseData);

      const progressRes = await api.get(`/progress/${courseData._id}`);
      setProgress(progressRes.data.data);
    } catch (err) {
      console.error('Failed to load course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCheckpointAnswer = (moduleId: string, qIndex: number, optIndex: number) => {
    setCheckpointAnswers((prev) => {
      const current = prev[moduleId] ? [...prev[moduleId]] : [];
      current[qIndex] = optIndex;
      return { ...prev, [moduleId]: current };
    });
  };

  const handleCompleteModule = async (moduleId: string) => {
    const activeMod = course?.modules.find(
      (m) => (m._id ? m._id.toString() : m.title) === moduleId,
    );

    const hasCheckpoint = activeMod?.checkpoint?.questions && activeMod.checkpoint.questions.length > 0;
    const answers = checkpointAnswers[moduleId] || [];

    if (hasCheckpoint && answers.length < activeMod.checkpoint!.questions.length) {
      toast.warning('Please answer all checkpoint verification questions before submitting.');
      return;
    }

    try {
      setCompleting(true);
      const res = await api.post('/progress/complete-module', {
        courseId: course!._id,
        moduleId,
        checkpointAnswers: hasCheckpoint ? answers : undefined,
      });
      const updated: CourseProgress = res.data.data;
      setProgress(updated);
      if (updated.completed) {
        toast.success('🎉 Grooming complete! Final quiz attempt is now unlocked.');
      } else {
        toast.success('Module & Checkpoint marked as completed!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update module progress');
    } finally {
      setCompleting(false);
    }
  };

  const getEmbedVideoUrl = (url: string) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Grooming Curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo text-center">
        <ShieldAlert className="w-10 h-10 text-alert-red mx-auto mb-3 stroke-[2.5px]" />
        <h3 className="font-black text-lg text-black dark:text-white">No Grooming Course Available</h3>
        <p className="text-xs font-bold text-black dark:text-white/60 mt-1">
          The employer has not yet attached grooming content for this role.
        </p>
        <div className="mt-4">
          <Link to={`/jobs/${jobId}`}>
            <NeoButton variant="primary" size="sm">
              Return to Circular
            </NeoButton>
          </Link>
        </div>
      </div>
    );
  }

  const activeModule = course.modules[activeModuleIndex] || course.modules[0];
  const activeModuleId = activeModule._id ? activeModule._id.toString() : activeModule.title;
  const isCurrentModuleCompleted = progress?.moduleProgress.some(
    (p) => p.moduleId === activeModuleId && p.completed,
  );

  const completedCount = progress?.moduleProgress.filter((p) => p.completed).length || 0;
  const progressPercent = Math.round((completedCount / course.modules.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-10 hidden sm:block rotate-12" />

      {/* Course Header with Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-8 border-4 border-black dark:border-white shadow-neo-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Remediation Track (RULE-003)</span>
            </NeoBadge>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">{course.title}</h1>
            {course.description && (
              <p className="text-xs font-bold text-black dark:text-white/70 mt-1 max-w-2xl">{course.description}</p>
            )}
          </div>

          {progress?.completed ? (
            <Link to={`/quiz/${jobId}`} className="shrink-0">
              <NeoButton variant="success" size="md">
                <span>Take Final Attempt</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
              </NeoButton>
            </Link>
          ) : (
            <div className="text-right self-start sm:self-auto bg-yellow-50 px-4 py-2 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
              <div className="text-[10px] font-black text-black dark:text-white/60 uppercase tracking-wider">Completion</div>
              <div className="text-2xl font-black text-black dark:text-white">{progressPercent}%</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mt-6 border-2 border-black dark:border-white overflow-hidden shadow-neo-sm">
          <div
            className="bg-main h-full transition-all duration-500 ease-out border-r-2 border-black dark:border-white"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Sidebar Modules + Active Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modules Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white px-2 mb-2">
            Modules List ({completedCount}/{course.modules.length} Completed)
          </div>
          {course.modules.map((mod, idx) => {
            const modId = mod._id ? mod._id.toString() : mod.title;
            const isCompleted = progress?.moduleProgress.some(
              (p) => p.moduleId === modId && p.completed,
            );
            const isActive = idx === activeModuleIndex;

            return (
              <div
                key={idx}
                onClick={() => setActiveModuleIndex(idx)}
                className={`p-3.5 rounded-base border-2 border-black dark:border-white transition cursor-pointer flex items-center justify-between gap-3 shadow-neo-sm select-none ${
                  isActive
                    ? 'bg-main text-black dark:text-white translate-x-1 shadow-neo'
                    : 'bg-white dark:bg-zinc-900 hover:bg-yellow-50 text-black dark:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-8 rounded-base border-2 border-black dark:border-white flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-success-mint text-black dark:text-white'
                        : isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-zinc-900 text-black dark:text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 stroke-[3px]" />
                    ) : mod.type === CourseModuleType.VIDEO ? (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    ) : mod.type === CourseModuleType.FILE ? (
                      <Paperclip className="w-3.5 h-3.5 stroke-[2.5px]" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 stroke-[2.5px]" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black truncate text-black dark:text-white">
                      {mod.title}
                    </p>
                    <span className="text-[10px] text-black dark:text-white/60 uppercase font-black">
                      {mod.type}
                    </span>
                  </div>
                </div>

                {isCompleted && (
                  <span className="text-[9px] font-black uppercase bg-success-mint text-black dark:text-white px-1.5 py-0.5 rounded border border-black dark:border-white shrink-0">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Module Content View */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-black dark:border-white/20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white/60">
                  Lesson #{activeModuleIndex + 1}
                </span>
                <h2 className="text-xl font-black text-black dark:text-white mt-0.5">{activeModule.title}</h2>
              </div>
              <NeoBadge variant="yellow" size="sm">
                {activeModule.type} lesson
              </NeoBadge>
            </div>

            {/* VIDEO LESSON */}
            {activeModule.type === CourseModuleType.VIDEO && (
              <div className="space-y-4">
                {activeModule.content.fileUrl && getEmbedVideoUrl(activeModule.content.fileUrl) ? (
                  <div className="aspect-video w-full rounded-base overflow-hidden border-2 border-black dark:border-white bg-black dark:bg-white shadow-neo-sm">
                    <iframe
                      src={getEmbedVideoUrl(activeModule.content.fileUrl)!}
                      title={activeModule.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : activeModule.content.fileUrl ? (
                  <div className="aspect-video w-full rounded-base overflow-hidden border-2 border-black dark:border-white bg-black dark:bg-white shadow-neo-sm flex items-center justify-center text-white dark:text-black">
                    <video
                      controls
                      src={activeModule.content.fileUrl}
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                ) : null}

                {activeModule.content.text && (
                  <div className="p-4 rounded-base bg-yellow-50/50 border-2 border-black dark:border-white text-xs font-medium text-black dark:text-white leading-relaxed whitespace-pre-line">
                    {activeModule.content.text}
                  </div>
                )}
              </div>
            )}

            {/* TEXT LESSON */}
            {activeModule.type === CourseModuleType.TEXT && (
              <div className="text-xs sm:text-sm font-medium text-black dark:text-white/90 leading-relaxed whitespace-pre-line bg-yellow-50/40 p-6 rounded-base border-2 border-black dark:border-white">
                {activeModule.content.text}
              </div>
            )}

            {/* FILE DOWNLOAD LESSON */}
            {activeModule.type === CourseModuleType.FILE && (
              <div className="space-y-4">
                {activeModule.content.text && (
                  <p className="text-xs font-bold text-black dark:text-white/80 leading-relaxed">{activeModule.content.text}</p>
                )}

                {activeModule.content.fileUrl && (
                  <div className="p-4 rounded-base bg-yellow-50 border-2 border-black dark:border-white flex items-center justify-between gap-4 shadow-neo-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-base bg-main border-2 border-black dark:border-white text-black dark:text-white flex items-center justify-center shrink-0 shadow-neo-sm">
                        <Download className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-black dark:text-white">
                          {activeModule.content.fileName || 'Curriculum_Resource.pdf'}
                        </div>
                        <div className="text-[10px] font-bold text-black dark:text-white/60">Official Employer Study Guide</div>
                      </div>
                    </div>

                    <a
                      href={activeModule.content.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black dark:bg-white text-white dark:text-black font-black px-4 py-2 rounded-base text-xs border-2 border-black dark:border-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition inline-flex items-center gap-1.5 shrink-0"
                    >
                      <span>Download File</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Checkpoint Micro-Quiz (RULE-019) */}
            {activeModule.checkpoint?.questions && activeModule.checkpoint.questions.length > 0 && (
              <div className="p-5 rounded-base bg-green-50 border-2 border-black dark:border-white space-y-4 mt-6 shadow-neo-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
                    <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                      Checkpoint Micro-Quiz (RULE-019)
                    </span>
                  </div>
                  <NeoBadge variant="green" size="sm">
                    {activeModule.checkpoint.questions.length} Question(s)
                  </NeoBadge>
                </div>

                <div className="space-y-4">
                  {activeModule.checkpoint.questions.map((cq, cqIdx) => {
                    const currentAns = (checkpointAnswers[activeModuleId] || [])[cqIdx];
                    return (
                      <div key={cqIdx} className="p-4 rounded-base bg-white dark:bg-zinc-900 border-2 border-black dark:border-white space-y-2.5 shadow-neo-sm">
                        <p className="text-xs font-black text-black dark:text-white">
                          {cqIdx + 1}. {cq.text}
                        </p>
                        <div className="space-y-2">
                          {cq.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              onClick={() => handleSelectCheckpointAnswer(activeModuleId, cqIdx, optIdx)}
                              className={`p-3 rounded-base border-2 border-black dark:border-white text-xs font-bold cursor-pointer flex items-center gap-2.5 transition select-none ${
                                currentAns === optIdx
                                  ? 'bg-main text-black dark:text-white shadow-neo-sm translate-x-1'
                                  : 'bg-white dark:bg-zinc-900 hover:bg-yellow-50 text-black dark:text-white shadow-neo-sm'
                              }`}
                            >
                              <div
                                className={`size-4 rounded-full border-2 border-black dark:border-white flex items-center justify-center shrink-0 ${
                                  currentAns === optIdx ? 'bg-black dark:bg-white' : 'bg-white dark:bg-zinc-900'
                                }`}
                              >
                                {currentAns === optIdx && <div className="size-1.5 rounded-full bg-white dark:bg-zinc-900" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t-2 border-dashed border-black dark:border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-black dark:text-white/60 font-black">
                {isCurrentModuleCompleted ? '✓ Module successfully verified' : 'Complete lesson to unlock final attempt'}
              </div>

              <NeoButton
                type="button"
                disabled={completing || isCurrentModuleCompleted}
                onClick={() => handleCompleteModule(activeModuleId)}
                variant={isCurrentModuleCompleted ? 'success' : 'primary'}
                size="md"
              >
                <CheckCircle className="w-4 h-4 mr-1.5 stroke-[3px]" />
                <span>
                  {completing
                    ? 'Evaluating...'
                    : isCurrentModuleCompleted
                    ? 'Completed ✓'
                    : activeModule.checkpoint?.questions?.length
                    ? 'Submit Checkpoint & Complete Module'
                    : 'Mark as Completed'}
                </span>
              </NeoButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
