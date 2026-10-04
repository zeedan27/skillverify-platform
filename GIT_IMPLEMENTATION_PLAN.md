# GitHub Collaboration & Implementation Plan

This document outlines how to split the "SkillVerify" (Team Unemployed) codebase among three team members for incremental Git commits, simulating a real-world collaborative development environment. 

As requested, **you (Person 1)** will initialize the repository and handle the **Applicant** side of the application.

---

## 🏗️ Part 1: Division of Responsibilities

### Person 1 (You): Foundation, Auth & Applicant Features
* **Role:** Repository Owner / Lead & Applicant Flow Developer.
* **Responsibilities:**
  * Initializing the Git repository.
  * Setting up the core project skeleton (Root configs, `shared/` types, DB connections).
  * Implementing Authentication (Login/Register).
  * Building the **Applicant Journey**: Job Browsing, Quiz Taking (with integrity checks), Grooming Course Progress, CV Generation, Badges, and Public Portfolios.

### Person 2: Employer Features & Candidate Pipeline
* **Role:** Employer Flow Developer.
* **Responsibilities:**
  * **Employer Dashboard & Profiles:** Company profiles and analytics.
  * **Creation Tools:** Job Circular creation, Course Builder, and Quiz Builder (including AI quiz generation).
  * **Hiring Pipeline:** Viewing candidate leaderboards, Candidate Reviews, Interview Scheduling, Offer Letters, and Direct Messaging.

### Person 3: Admin Operations & System Services
* **Role:** Admin & Platform Services Developer.
* **Responsibilities:**
  * **Admin Operations:** Admin dashboard, user/job suspension, audit logs (`backend/src/modules/admin`).
  * **Global Analytics:** Platform-wide analytics (`backend/src/modules/analytics`).
  * **Notifications:** Real-time notification center (`backend/src/modules/notifications`, frontend Bell and Page).
  * **Storage & Seeding:** Firebase storage integrations and database seeding scripts (`backend/src/scripts/seed.ts`).

---

## 🚀 Part 2: Repository Setup & Git Flow

Since you need to create the repo and push incrementally, we will use a structured commit strategy rather than uploading everything at once. 

**Pre-requisites:**
Before pushing, we must create a `.gitignore` to prevent uploading node_modules and log files. 
*(Let me know if you want me to generate this `.gitignore` for you).*

### Initial Setup Steps:
1. Go to your GitHub account (`zeedan27`) and create a new empty repository (e.g., `skillverify-platform`).
2. Do **not** check "Initialize with a README, .gitignore, or license" (we will push our existing local files).
3. In your terminal, inside `d:\Projects\MAD Project`:
   ```bash
   git init
   git remote add origin https://github.com/zeedan27/skillverify-platform.git
   git branch -M main
   ```
4. Add your teammates as **Collaborators** in the GitHub Repository Settings so they can push their parts later.

---

## 📦 Part 3: Your Commit & Push Plan (Applicant Side)

To show incremental progress, you will make a series of targeted commits. Here is your step-by-step Git execution plan:

### Commit 1: Project Foundation & Shared Architecture
**Goal:** Establish the root structure and shared types so your teammates can start working.
* **Files to add:**
  * Root files (`package.json`, `tsconfig.json`, `.gitignore`, `*.md` files except this plan)
  * `shared/` directory (Enums, Types, Interfaces)
  * `backend/src/app.module.ts`, `backend/src/main.ts`, `backend/src/database.helper.ts`
  * `backend/src/common/` (Decorators, Filters, Guards)
  * `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/vite.config.ts`, Tailwind/PostCSS configs
* **Commands:**
  ```bash
  git add package.json tsconfig.json .gitignore *.md shared/ backend/src/app.module.ts backend/src/main.ts backend/src/database.helper.ts backend/src/common/ frontend/src/App.tsx frontend/src/main.tsx frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/package.json
  git commit -m "chore: Initialize project structure, shared types, and core configuration"
  git push -u origin main
  ```

### Commit 2: Authentication & Core User Setup
**Goal:** Implement the auth layer and basic User module.
* **Files to add:**
  * `backend/src/modules/auth/`
  * `backend/src/modules/users/`
  * `frontend/src/context/AuthContext.tsx`
  * `frontend/src/pages/auth/` (Login, Register, Forgot Password)
  * `frontend/src/api/client.ts`
* **Commands:**
  ```bash
  git add backend/src/modules/auth/ backend/src/modules/users/ frontend/src/context/AuthContext.tsx frontend/src/pages/auth/ frontend/src/api/client.ts
  git commit -m "feat: Implement authentication, JWT strategies, and user schemas"
  git push
  ```

### Commit 3: Applicant Core Journey (Jobs & Quizzes)
**Goal:** Allow an applicant to browse jobs and take a quiz.
* **Files to add:**
  * `backend/src/modules/jobs/` (Read-only operations for applicant)
  * `backend/src/modules/quiz/` (Attempting the quiz, integrity checks)
  * `frontend/src/pages/applicant/JobBrowsePage.tsx`, `JobDetailsPage.tsx`
  * `frontend/src/pages/applicant/QuizPage.tsx`
  * `frontend/src/context/` (ThemeContext, ToastContext)
  * UI Components (`frontend/src/components/ui/` NeoCard, NeoButton, etc.)
* **Commands:**
  ```bash
  git add backend/src/modules/jobs/ backend/src/modules/quiz/ frontend/src/pages/applicant/JobBrowsePage.tsx frontend/src/pages/applicant/JobDetailsPage.tsx frontend/src/pages/applicant/QuizPage.tsx frontend/src/context/ frontend/src/components/ui/
  git commit -m "feat(applicant): Add job browsing and secure quiz execution engine"
  git push
  ```

### Commit 4: Grooming, Progress & Gamification
**Goal:** Implement the learning phase and rewards.
* **Files to add:**
  * `backend/src/modules/progress/`
  * `backend/src/modules/badges/`
  * `frontend/src/pages/applicant/GroomingPage.tsx`
  * `frontend/src/pages/applicant/ApplicantLeaderboardPage.tsx`
* **Commands:**
  ```bash
  git add backend/src/modules/progress/ backend/src/modules/badges/ frontend/src/pages/applicant/GroomingPage.tsx frontend/src/pages/applicant/ApplicantLeaderboardPage.tsx
  git commit -m "feat(applicant): Implement grooming module progress tracking and gamification badges"
  git push
  ```

### Commit 5: Portfolios & CV Generation
**Goal:** Finalize the applicant output (CVs and Public profiles).
* **Files to add:**
  * `backend/src/modules/cv/`
  * `backend/src/modules/public/`
  * `frontend/src/pages/applicant/ApplicantProfilePage.tsx`
  * `frontend/src/pages/applicant/CVPreviewPage.tsx`
  * `frontend/src/pages/public/PublicPortfolioPage.tsx`
  * `frontend/src/components/Navbar.tsx`
  * Remaining applicant files and generic frontend utils.
* **Commands:**
  ```bash
  git add backend/src/modules/cv/ backend/src/modules/public/ frontend/src/pages/applicant/ frontend/src/pages/public/ frontend/src/components/Navbar.tsx frontend/src/utils/ frontend/src/index.css
  git commit -m "feat(applicant): Add dynamic CV generation and public portfolio views"
  git push
  ```

---

## 🤝 Part 4: Teammate Onboarding (After Your Commits)

Once you have completed your 5 commits, the foundational app will be on GitHub. 
Your teammates will then:
1. `git clone https://github.com/zeedan27/skillverify-platform.git`
2. **Person 2** will create a new branch (`git checkout -b feature/employer-flow`), copy their assigned files (Employer pages, AI quiz generator, Pipeline components) into their local repo, commit them, and push their branch.
3. **Person 3** will create a new branch (`git checkout -b feature/admin-system`), copy their assigned files (Admin pages, Notifications, Analytics) into their local repo, commit them, and push.
4. You can then review their Pull Requests on GitHub and merge them into `main`.
