import React from 'react';
import { X, Check, FileQuestion, AlertTriangle, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { NeoCard } from './NeoCard';
import { NeoBadge } from './NeoBadge';

export const BranchingDiagram: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-8">
      {/* SVG Connecting Lines for Desktop */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full z-0 hidden md:block pointer-events-none"
      >
        {/* Left Branch: Dashed Red */}
        <path
          d="M 50 16 Q 25 24 25 38 L 25 80"
          stroke="#EF4444"
          strokeWidth="3.5"
          vectorEffect="non-scaling-stroke"
          fill="none"
          strokeDasharray="6 6"
        />
        {/* Right Branch: Solid Green */}
        <path
          d="M 50 16 Q 75 24 75 38 L 75 80"
          stroke="#22C55E"
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>

      {/* Top Root Node */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white px-6 sm:px-10 py-4 rounded-base shadow-neo text-center">
          <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
            The Candidate
          </NeoBadge>
          <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black dark:text-white">
            Applies For A Job
          </h3>
          <p className="font-bold text-black dark:text-white/70 text-sm">
            Claims full-stack mastery & 5+ years experience
          </p>
        </div>
      </div>

      {/* Two Branch Columns */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        {/* Left Column: Traditional Resumes (The Flawed Way) */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md bg-red-50 border-4 border-black dark:border-white p-6 rounded-base shadow-neo-red">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b-3 border-black dark:border-white pb-3">
              <div className="bg-alert-red p-2 rounded-full border-2 border-black dark:border-white text-white dark:text-black shrink-0">
                <X className="size-5 stroke-[3px]" />
              </div>
              <div>
                <h4 className="font-black text-lg uppercase tracking-tight text-black dark:text-white">
                  Resume-Only Guesswork
                </h4>
                <p className="text-xs font-bold text-alert-red">Unchecked self-reporting</p>
              </div>
            </div>

            {/* Cons list */}
            <ul className="space-y-3 font-bold text-black dark:text-white text-sm">
              <li className="flex gap-2.5 items-start">
                <FileQuestion className="size-5 text-alert-red shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">ChatGPT CVs:</strong> Fluffed buzzwords with zero proof of actual execution.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <AlertTriangle className="size-5 text-alert-red shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">Screening Fatigue:</strong> Engineering managers waste 20+ hours on unqualified interviews.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <X className="size-5 text-alert-red shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">Cheating Blindspot:</strong> Take-home assignments solved by generative AI with no integrity tracking.
                </span>
              </li>
            </ul>
          </div>

          {/* Left Result Pill */}
          <div className="mt-5 bg-white dark:bg-zinc-900 border-3 border-alert-red px-6 py-2.5 rounded-base shadow-neo-sm text-center">
            <p className="font-black text-alert-red uppercase tracking-widest text-xs">Result</p>
            <p className="font-black text-base text-black dark:text-white">Costly Bad Hire & Wasted Time</p>
          </div>
        </div>

        {/* Right Column: SkillVerify (The Right Way) */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md bg-green-50 border-4 border-black dark:border-white p-6 rounded-base shadow-neo-green">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b-3 border-black dark:border-white pb-3">
              <div className="bg-success-mint p-2 rounded-full border-2 border-black dark:border-white text-black dark:text-white shrink-0">
                <Check className="size-5 stroke-[3px]" />
              </div>
              <div>
                <h4 className="font-black text-lg uppercase tracking-tight text-black dark:text-white">
                  The SkillVerify Way
                </h4>
                <p className="text-xs font-bold text-green-700">Verifiable skill assessments</p>
              </div>
            </div>

            {/* Pros list */}
            <ul className="space-y-3 font-bold text-black dark:text-white text-sm">
              <li className="flex gap-2.5 items-start">
                <ShieldCheck className="size-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">Proctored Quiz Engine:</strong> Server-enforced timers, randomized pools, and anti-cheat blur tracking.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Trophy className="size-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">Grooming & Retries:</strong> Candidates complete targeted modules to unlock their final attempt.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Sparkles className="size-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black">Cryptographic Badge:</strong> 12-character tamper-proof verify codes with verifiable skill rankings.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Result Pill */}
          <div className="mt-5 bg-main border-3 border-black dark:border-white px-6 py-2.5 rounded-base shadow-neo text-center">
            <p className="font-black text-black dark:text-white/60 uppercase tracking-widest text-xs">Result</p>
            <p className="font-black text-base text-black dark:text-white">Pre-Vetted Top 5% Candidates</p>
          </div>
        </div>
      </div>
    </div>
  );
};
