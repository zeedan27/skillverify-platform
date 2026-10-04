import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldAlert, Award, Terminal, ArrowRight, Star, Sparkles, BookOpen, Clock, Users } from 'lucide-react';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoBadge } from '../components/ui/NeoBadge';
import { NeoAccordion, NeoAccordionItem } from '../components/ui/NeoAccordion';
import { BeforeAfterSlider } from '../components/ui/BeforeAfterSlider';
import { BranchingDiagram } from '../components/ui/BranchingDiagram';
import { DecorativeSparkle } from '../components/ui/DecorativeSparkle';

export const LandingPage: React.FC = () => {
  const faqItems: NeoAccordionItem[] = [
    {
      id: 'faq-1',
      question: 'How does SkillVerify ensure assessment integrity?',
      answer: 'SkillVerify enforces timed assessment sessions with server-side countdown verification (plus a 15-second network grace window) and logs tab switches, window blurs, and fullscreen exits to maintain transparent candidate audit trails.',
    },
    {
      id: 'faq-2',
      question: 'What happens if an applicant fails the first quiz attempt?',
      answer: 'Unlike traditional one-and-done filters, candidates who do not achieve passing score enter a curated Grooming Track. Completing checkpoint modules unlocks their second and final attempt.',
    },
    {
      id: 'faq-3',
      question: 'Can employers customize quiz questions and passing thresholds?',
      answer: 'Yes. Employers can define question pools (10 to 40 questions), randomize delivered subsets (10 to 20 questions), set passing scores between 50% and 100%, and even generate verified question drafts with AI assistance.',
    },
    {
      id: 'faq-4',
      question: 'How do Skill Badges and public verification work?',
      answer: 'Passing candidates receive a digital Skill Badge (Bronze, Silver, or Gold) backed by a 12-character cryptographic verify code. Anyone can inspect valid credentials at /verify/:slug without exposing candidate contact details.',
    },
    {
      id: 'faq-5',
      question: 'Are CVs generated automatically or manually uploaded?',
      answer: 'In SkillVerify, CVs are never manually uploaded PDF files that can be inflated with fake claims. They are dynamically generated from verified profile data and authenticated quiz scores.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-canvas dark:bg-zinc-950 selection:bg-main selection:text-black dark:text-white">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION (Yellow-tinted with graph paper pattern)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-grid-pattern-yellow border-b-4 border-black dark:border-white pt-8 pb-16 md:py-20 px-4">
        {/* Decorative corner stars */}
        <DecorativeSparkle size={48} colorClass="text-yellow-400" className="absolute top-6 left-6 hidden lg:block -rotate-12" />
        <DecorativeSparkle size={40} colorClass="text-main" className="absolute bottom-10 right-10 hidden lg:block rotate-12" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Pill Tag */}
              <div className="mb-4">
                <NeoBadge variant="white" slanted="-rotate-2" pulsingDot dotColor="bg-alert-red">
                  Next-Gen Hiring Platform
                </NeoBadge>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black dark:text-white leading-tight tracking-tight mb-5">
                Don't trust resumes. <br className="hidden sm:block" />
                You need to{' '}
                <span className="inline-block relative">
                  <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-sm border-2 border-black dark:border-white -rotate-1 shadow-[4px_4px_0px_0px_#FFDC58] inline-block">
                    verify
                  </span>
                </span>
                .
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl font-bold text-black dark:text-white/75 max-w-xl leading-relaxed mb-6">
                SkillVerify proctors timed technical assessments, unlocks structured grooming courses for retries, and generates tamper-proof credentials directly for top tech teams.
              </p>

              {/* Checklist bullets */}
              <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-black dark:text-white mb-6 bg-white dark:bg-zinc-900/70 border-2 border-black dark:border-white px-3.5 py-1.5 rounded-full shadow-neo-sm">
                <div className="size-4 bg-success-mint rounded-full border border-black dark:border-white flex items-center justify-center">
                  <Check className="size-3 stroke-[3px]" />
                </div>
                <span>Server-enforced timers & integrity monitoring included</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8">
                <Link to="/jobs">
                  <NeoButton variant="primary" size="lg" className="w-full sm:w-auto">
                    Browse Verified Jobs
                    <ArrowRight className="size-5 ml-2" />
                  </NeoButton>
                </Link>
                <Link to="/register">
                  <NeoButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    Employer Sign Up
                  </NeoButton>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="flex -space-x-2.5">
                  <div className="size-9 rounded-full border-2 border-black dark:border-white bg-yellow-200 flex items-center justify-center font-black text-xs">
                    JD
                  </div>
                  <div className="size-9 rounded-full border-2 border-black dark:border-white bg-green-200 flex items-center justify-center font-black text-xs">
                    SK
                  </div>
                  <div className="size-9 rounded-full border-2 border-black dark:border-white bg-blue-200 flex items-center justify-center font-black text-xs">
                    AL
                  </div>
                  <div className="size-9 rounded-full border-2 border-black dark:border-white bg-purple-200 flex items-center justify-center font-black text-xs">
                    RM
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-current stroke-black stroke-1" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-black dark:text-white/70">
                    <strong className="text-black dark:text-white font-black">500+ candidates</strong> evaluated & hired
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Comparison Widget */}
            <div className="w-full max-w-lg mx-auto">
              <BeforeAfterSlider
                beforeLabel="Unverified CV"
                afterLabel="SkillVerify Validated"
                beforeContent={
                  <div className="w-full h-full bg-red-100 p-6 flex flex-col justify-between border-r-2 border-black dark:border-white">
                    <div>
                      <div className="flex items-center gap-2 text-alert-red font-black text-sm mb-2">
                        <ShieldAlert className="size-5" />
                        <span>Self-Claimed Resume</span>
                      </div>
                      <h4 className="text-xl font-black text-black dark:text-white">John Doe</h4>
                      <p className="text-xs font-bold text-black dark:text-white/60 mb-4">"Full Stack Ninja & AI Guru"</p>
                      
                      <div className="space-y-2 text-xs font-bold text-black dark:text-white">
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-black dark:border-white">
                          ❌ 5+ years React (Actually 2 months)
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-black dark:border-white">
                          ❌ No verified test scores
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-black dark:border-white">
                          ⚠️ Solved take-home via copy-paste
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-200 border-2 border-black dark:border-white p-2 text-center text-xs font-black text-alert-red rounded">
                      High Hiring Risk
                    </div>
                  </div>
                }
                afterContent={
                  <div className="w-full h-full bg-green-50 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-green-700 font-black text-sm mb-2">
                        <Award className="size-5" />
                        <span>SkillVerify Authenticated</span>
                      </div>
                      <h4 className="text-xl font-black text-black dark:text-white">John Doe</h4>
                      <p className="text-xs font-bold text-green-800 mb-4">Gold Tier Verified Developer</p>
                      
                      <div className="space-y-2 text-xs font-bold text-black dark:text-white">
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border-2 border-black dark:border-white flex justify-between items-center">
                          <span>TypeScript & NestJS</span>
                          <span className="font-black text-green-600">Score: 92%</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border-2 border-black dark:border-white flex justify-between items-center">
                          <span>Exam Integrity</span>
                          <span className="font-black text-black dark:text-white">0 Tab Switches</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border-2 border-black dark:border-white flex justify-between items-center">
                          <span>Verify Code</span>
                          <span className="font-mono text-purple-700 font-black">#SKV-9482-GOLD</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-success-mint border-2 border-black dark:border-white p-2 text-center text-xs font-black text-black dark:text-white rounded">
                      Production Ready • Instant Interview
                    </div>
                  </div>
                }
              />
              <p className="mt-3 text-center text-xs sm:text-sm font-bold text-black dark:text-white/60">
                Drag the slider to compare unverified claims vs. validated data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: CORE PILLARS / "Think Before You Hire"
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-900 bg-grid-pattern border-b-4 border-black dark:border-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <NeoBadge variant="yellow" slanted="-rotate-1" className="mb-4">
            The Verified Standard
          </NeoBadge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black dark:text-white leading-tight mb-4">
            Test Like an Architect, <br className="hidden sm:block" />
            <span className="bg-main px-3 py-0.5 border-2 border-black dark:border-white inline-block shadow-neo-sm transform -rotate-1">
              Before You Interview
            </span>
          </h2>
          <p className="text-base sm:text-lg font-bold text-black dark:text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate hours of manual resume screening with structured, proctored assessments tied directly to your job circulars.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-4 font-bold text-black dark:text-white text-sm shadow-neo-sm hover:translate-x-1 transition-transform">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-black dark:border-white bg-success-mint text-black dark:text-white mt-0.5">
                <Check className="size-4 stroke-[3px]" />
              </span>
              <div>
                <strong className="block text-black dark:text-white font-black text-base">Server-Enforced Timers</strong>
                15-second grace window with server-side validation prevents local client clock manipulation.
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-4 font-bold text-black dark:text-white text-sm shadow-neo-sm hover:translate-x-1 transition-transform">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-black dark:border-white bg-success-mint text-black dark:text-white mt-0.5">
                <Check className="size-4 stroke-[3px]" />
              </span>
              <div>
                <strong className="block text-black dark:text-white font-black text-base">Randomized Question Pools</strong>
                Delivers 10-20 random questions from a pool of up to 40 to combat leak sharing.
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-4 font-bold text-black dark:text-white text-sm shadow-neo-sm hover:translate-x-1 transition-transform">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-black dark:border-white bg-success-mint text-black dark:text-white mt-0.5">
                <Check className="size-4 stroke-[3px]" />
              </span>
              <div>
                <strong className="block text-black dark:text-white font-black text-base">Grooming & Retries</strong>
                Unlocks a second attempt only after candidates complete interactive learning modules.
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-4 font-bold text-black dark:text-white text-sm shadow-neo-sm hover:translate-x-1 transition-transform">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-black dark:border-white bg-success-mint text-black dark:text-white mt-0.5">
                <Check className="size-4 stroke-[3px]" />
              </span>
              <div>
                <strong className="block text-black dark:text-white font-black text-base">Cryptographic Badges</strong>
                Unique 12-character verify codes renderable on public portfolios without data leaks.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: BRANCHING DECISION TREE
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-canvas dark:bg-zinc-950 border-b-4 border-black dark:border-white py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black dark:text-white leading-tight mb-3">
              Two Paths in Tech Hiring
            </h2>
            <p className="text-base sm:text-lg font-bold text-black dark:text-white/70">
              Why leading employers replace resume screening with SkillVerify.
            </p>
          </div>

          <BranchingDiagram />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: PROBLEM TO FIX (3 Step Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-main/15 border-b-4 border-black dark:border-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mb-3">
              It's Not a Talent Problem
            </h2>
            <div className="inline-block bg-main px-4 py-1.5 border-2 border-black dark:border-white shadow-neo-sm -rotate-1">
              <span className="text-lg sm:text-xl font-black text-black dark:text-white">It's a verification problem</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <NeoCard variant="stacked-red" padding="md">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-black dark:border-white/20">
                <div className="size-10 bg-alert-red rounded-full border-2 border-black dark:border-white flex items-center justify-center text-white dark:text-black font-black text-sm">
                  1
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-alert-red">The Problem</p>
                  <h4 className="font-black text-lg text-black dark:text-white">Resume Inflation</h4>
                </div>
              </div>
              <p className="text-sm font-bold text-black dark:text-white/80 leading-relaxed">
                Candidates paste AI-generated cover letters and keywords. You can't tell who actually wrote the code until the 4th interview round.
              </p>
            </NeoCard>

            {/* Step 2 */}
            <NeoCard variant="stacked-yellow" padding="md">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-black dark:border-white/20">
                <div className="size-10 bg-amber-400 rounded-full border-2 border-black dark:border-white flex items-center justify-center text-black dark:text-white font-black text-sm">
                  2
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-amber-800">The Flaw</p>
                  <h4 className="font-black text-lg text-black dark:text-white">Broken Take-Homes</h4>
                </div>
              </div>
              <p className="text-sm font-bold text-black dark:text-white/80 leading-relaxed">
                Take-home projects are solved by generative AI in 10 minutes or abandoned by busy senior engineers who refuse unpaid labor.
              </p>
            </NeoCard>

            {/* Step 3 */}
            <NeoCard variant="stacked-green" padding="md">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-black dark:border-white/20">
                <div className="size-10 bg-success-mint rounded-full border-2 border-black dark:border-white flex items-center justify-center text-black dark:text-white font-black text-sm">
                  3
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-green-800">The Fix</p>
                  <h4 className="font-black text-lg text-black dark:text-white">Proctored Proof</h4>
                </div>
              </div>
              <p className="text-sm font-bold text-black dark:text-white/80 leading-relaxed">
                SkillVerify's 15-minute proctored tests evaluate foundational mental models and problem-solving, creating a real leaderboard of top candidates.
              </p>
            </NeoCard>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: TESTIMONIAL SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-canvas dark:bg-zinc-950 border-b-4 border-black dark:border-white py-16 px-4 relative overflow-hidden">
        <DecorativeSparkle size={36} colorClass="text-purple-400" className="absolute top-8 left-8 hidden md:block" />
        <DecorativeSparkle size={44} colorClass="text-main" className="absolute bottom-8 right-8 hidden md:block -rotate-12" />

        <div className="max-w-3xl mx-auto">
          <NeoCard borderWidth="4" shadowSize="lg" className="text-center p-8 md:p-12 relative">
            <div className="inline-block bg-main border-2 border-black dark:border-white px-3 py-1 rounded-sm shadow-neo-sm -rotate-2 font-black text-xs uppercase mb-6">
              Verified Candidate Review
            </div>

            <blockquote className="text-xl md:text-2xl font-black text-black dark:text-white leading-snug mb-8">
              "SkillVerify let me prove my skills directly. After failing attempt 1, the grooming track showed me exactly where I had gaps in database normalization. I aced attempt 2 and got hired within a week!"
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="size-12 rounded-full border-2 border-black dark:border-white bg-blue-200 flex items-center justify-center font-black text-base">
                PK
              </div>
              <div className="text-left">
                <p className="font-black text-base text-black dark:text-white">Paolo K.</p>
                <p className="text-xs font-bold text-black dark:text-white/60">Hired as Full-Stack Engineer • Gold Badge</p>
              </div>
            </div>
          </NeoCard>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FAQS
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-900 border-b-4 border-black dark:border-white py-16 px-4" id="faqs">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white mb-3">
              Frequently Asked{' '}
              <span className="bg-main px-2 py-0.5 border-2 border-black dark:border-white inline-block shadow-neo-sm -rotate-1">
                Questions
              </span>
            </h2>
            <p className="text-base font-bold text-black dark:text-white/70">
              Everything you need to know about SkillVerify's verification pipeline.
            </p>
          </div>

          <NeoAccordion items={faqItems} defaultOpenId="faq-1" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-pink-200 py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 md:p-12 rounded-base shadow-neo-xl text-center">
          <NeoBadge variant="black" slanted="-rotate-1" size="sm" className="mb-4">
            Zero-Guesswork Hiring
          </NeoBadge>

          <h2 className="text-3xl sm:text-5xl font-black text-black dark:text-white leading-tight mb-4">
            Stop Guessing. <br />
            <span className="bg-success-mint px-3 py-1 border-2 border-black dark:border-white inline-block shadow-neo-sm">
              Start Verifying.
            </span>
          </h2>

          <p className="text-base sm:text-lg font-bold text-black dark:text-white/75 max-w-xl mx-auto mb-8">
            Join forward-thinking engineering teams and candidates. Take the test or create your first skill-verified job circular in under 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/jobs">
              <NeoButton variant="primary" size="lg" className="w-full sm:w-auto">
                Explore Available Jobs
              </NeoButton>
            </Link>
            <Link to="/register">
              <NeoButton variant="black" size="lg" className="w-full sm:w-auto">
                Register as Employer
              </NeoButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
