# SkillVerify — Master Task Plan
> **CSE 4181 · Mobile Application Development · Team Unemployed**
> Stack: React (Frontend) + NestJS (Backend) | Updated: 2026-09-01

---

## Team Roster & Ownership

| Member | ID | Primary Domain |
|---|---|---|
| **Zesrab Tanjeel Khan** | 0112230941 | Backend (NestJS), Auth & RBAC, CV Generation |
| **Muntaka Tasnim Rahman** | 0112230954 | Frontend (React), Applicant UX & Leaderboard |
| **Mohammad Akibul Hasan** | 0112230167 | Frontend (React), Employer Dashboard & Admin Console |

---

## Phase Map (B.L.A.S.T)

| Phase | Code | Weeks | Focus |
|---|---|---|---|
| Blueprint | B | 1-2 | Architecture, schemas, Figma, DB design |
| Link | L | 2 | Backend connections, env verification |
| Architect | A | 3-8 | Role-based feature build |
| Stylize | S | 8 | UI refinement, CV polish, leaderboard |
| Trigger | T | 9 | QA, bug fixes, deployment, presentation |

---

## Week 1 - Research & Design (Blueprint)

### Zesrab
- [ ] Draft gemini.md TypeScript interfaces (Auth, Quiz, Course, CV)
- [ ] Define NestJS module tree (auth, quiz, course, cv, leaderboard, admin)
- [ ] Choose database: Firebase Firestore vs MongoDB Atlas
- [ ] Set up monorepo structure (/frontend, /backend, /shared/types)
- [ ] Initialize NestJS project with TypeScript strict mode

### Muntaka
- [ ] Wireframe Applicant flows: Browse -> Quiz -> Pass/Fail -> Groom -> Reapply
- [ ] Create Figma prototype: Job Browse page, Quiz page, Leaderboard page
- [ ] Define shared React component library structure

### Akibul
- [ ] Wireframe Employer flows: Post Job -> Create Quiz -> Upload Course -> View Leaderboard
- [ ] Wireframe Admin Console: User list, Company list, Content moderation
- [ ] Set up React project with Vite + TailwindCSS + shadcn/ui

---

## Week 2 - Figma Finalization & DB Connection (Blueprint -> Link)

### Zesrab
- [ ] Configure .env with all credentials (DB, Firebase/S3, JWT secret)
- [ ] Write DB connection verification script (scripts/verify-db.ts)
- [ ] Write Cloud Storage connection verification script
- [ ] Set up NestJS ConfigModule and DatabaseModule
- [ ] Initialize Prisma ORM (if MongoDB) or Firebase Admin SDK

### Muntaka
- [ ] Review and finalize Applicant Figma screens
- [ ] Set up React Router v6 route structure for Applicant role
- [ ] Build AuthContext + useAuth hook skeleton

### Akibul
- [ ] Review and finalize Employer + Admin Figma screens
- [ ] Set up React Router v6 route structure for Employer and Admin roles
- [ ] Build role-based PrivateRoute wrapper component

---

## Week 3 - Auth, Job Circulars & Quiz Engine (Architect - Layer 4)

### Zesrab
- [ ] Implement AuthModule: JWT strategy, refresh tokens, role guards
- [ ] Implement UserModule: CRUD for all 3 roles
- [ ] Implement JobModule: CRUD for job circulars (employer-owned)
- [ ] Implement QuizModule: create quiz, attach to job, grade attempt
- [ ] Write unit tests: AuthGuard, RolesGuard, QuizGrader

### Muntaka
- [ ] Build Login / Register pages (Applicant-specific flow)
- [ ] Build Job Browse page: circular cards, search, filter by role/company
- [ ] Build Quiz page: question renderer, timer, submit handler

### Akibul
- [ ] Build Login page for Employer role
- [ ] Build Employer Dashboard: job circular list + Create Job form
- [ ] Build Quiz Builder: add/edit/delete questions with correct answer marking

---

## Week 4 - Applicant Flow: Pass/Fail Gate (Architect - Layer 1)

### Zesrab
- [ ] Enforce gating: GET /jobs/:id/apply returns 403 if quiz not passed
- [ ] Implement QuizAttemptModule: record attempts, enforce 2-attempt max
- [ ] Add attempt state machine: NOT_STARTED -> ATTEMPTED -> PASSED | FAILED -> GROOMING_REQUIRED -> FINAL_ATTEMPT -> LOCKED

### Muntaka
- [ ] Build Quiz Result page: Pass -> show Apply button; Fail -> show Enroll in Grooming
- [ ] Integrate gating: hide/disable Apply button based on quiz state
- [ ] Build Applicant Profile page: editable fields that feed CV generation

### Akibul
- [ ] Build Employer: Applications Received list (only quiz-passed applicants shown)
- [ ] Add Last Updated timestamp display to job circular cards

---

## Week 5 - Grooming Course Build (Architect - Layer 2 + Layer 4)

### Zesrab
- [ ] Implement CourseModule: create course, attach modules (video/file/text)
- [ ] Implement ProgressModule: track per-user module completion
- [ ] Integrate Cloud Storage: signed upload URLs for employer video/file uploads
- [ ] Enforce course-completion check before unlocking final quiz attempt

### Muntaka
- [ ] Build Grooming Course Dashboard (Applicant): module list, progress bar, video player
- [ ] Build Module completion tracker: mark each module done, show % complete
- [ ] Gate Final Attempt button until progress.completed === true

### Akibul
- [ ] Build Course Creator (Employer): upload video, add text/file modules, reorder
- [ ] Build Course Completion View (Employer): list of applicants who finished grooming

---

## Week 6 - CV Auto-Generation (Architect - Layer 4)

### Zesrab
- [ ] Implement CVModule: NestJS service using Puppeteer or pdfmake to render profile -> PDF
- [ ] Define CV template: name, skills, quiz scores, work experience, education
- [ ] Store generated PDF to Cloud Storage; return signed URL
- [ ] Expose GET /cv/:applicantId (employer-only guard)

### Muntaka
- [ ] Build CV Preview page (Applicant): see how their auto-generated CV looks
- [ ] Add Regenerate CV button that triggers backend re-render

### Akibul
- [ ] Integrate CV download into Employer Leaderboard: Download CV button per candidate
- [ ] Build CV Download Manager: batch-download top N CVs as ZIP

---

## Week 7 - Leaderboard & Ranking (Architect - Layer 1 & 2)

### Zesrab
- [ ] Implement LeaderboardModule: rank applicants by quiz score per job + company
- [ ] Expose GET /leaderboard/:jobId (employer + applicant-limited views)
- [ ] Applicant view: own rank + score only for that role
- [ ] Employer view: full ranked list with score, name, completion status

### Muntaka
- [ ] Build Applicant Leaderboard page: rank card, score, position in queue

### Akibul
- [ ] Build Employer Leaderboard page: ranked table with CV download + grooming status
- [ ] Add Select Top N bulk action for downloading CVs

---

## Week 8 - Admin Console & Stylize (Architect - Layer 3 + Stylize)

### Zesrab
- [ ] Implement AdminModule: system-wide override endpoints
- [ ] Add audit logging: all admin actions recorded with timestamp + admin ID
- [ ] Finalize RBAC: Admin > Employer > Applicant guard hierarchy

### Muntaka
- [ ] UI refinement pass: Applicant flows - spacing, typography, color tokens
- [ ] Polish leaderboard animations and loading skeletons

### Akibul
- [ ] Build Admin Console: user management table (add/edit/suspend/delete)
- [ ] Build Admin: Company management (suspend, remove employer accounts)
- [ ] Build Admin: Content moderation panel (flag/remove jobs, quizzes, courses)
- [ ] UI refinement pass: Employer + Admin dashboards

---

## Week 9 - QA, Bug Fixes & Launch (Trigger)

### Zesrab
- [ ] End-to-end test: full applicant journey
- [ ] End-to-end test: employer journey
- [ ] Security audit: verify all RBAC guards
- [ ] Deploy backend to Railway / Render / AWS EC2
- [ ] Configure production environment variables

### Muntaka
- [ ] Cross-browser + responsive testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Fix all critical UI bugs from QA

### Akibul
- [ ] Integration testing: Employer <-> Backend API
- [ ] Admin Console edge case testing
- [ ] Deploy frontend to Vercel / Netlify
- [ ] Finalize project presentation slides and demo video

---

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| PDF generation instability (Puppeteer) | High | Fallback to pdfmake; test in CI |
| NestJS DI failures on module lazy-loading | Medium | Use forwardRef() pattern; integration test all guards |
| Quiz attempt state corruption | High | Implement idempotent state machine with DB transactions |
| Cloud Storage costs | Medium | Use Firebase free tier; cap file sizes |
| Team merge conflicts on shared types | Medium | Lock gemini.md interfaces; PR review required for changes |
