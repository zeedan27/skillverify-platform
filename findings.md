# SkillVerify — Technical Findings & Architecture Decisions
> Updated: 2026-09-01 | Governed by gemini.md

---

## 1. Database Decision

### Options Evaluated

| Criterion | Firebase Firestore | MongoDB Atlas |
|---|---|---|
| Real-time sync | Native | Requires Change Streams |
| Offline support | Built-in | Manual |
| Schema flexibility | High (NoSQL) | High (NoSQL) |
| NestJS integration | Firebase Admin SDK | Mongoose / Prisma |
| Querying power | Limited (no joins) | Aggregation pipeline |
| Free tier | Generous (Spark) | 512 MB M0 cluster |
| File storage | Firebase Storage | GridFS or S3 |

### Decision: **MongoDB Atlas + Firebase Storage**

**Rationale:**
- MongoDB Atlas provides richer aggregation queries needed for leaderboard ranking logic
- NestJS + Mongoose integration is battle-tested and well-documented
- Firebase Storage handles video/file uploads for grooming courses and generated PDFs with CDN-level performance
- Keeps structured data (users, quizzes, jobs) separate from binary assets

---

## 2. NestJS Module Architecture

```
backend/
  src/
    app.module.ts                  # Root module
    common/
      guards/
        jwt-auth.guard.ts          # Validates JWT
        roles.guard.ts             # Enforces @Roles() decorator
      decorators/
        roles.decorator.ts         # @Roles(Role.EMPLOYER)
      filters/
        http-exception.filter.ts
      interceptors/
        logging.interceptor.ts
    modules/
      auth/
        auth.module.ts
        auth.controller.ts
        auth.service.ts
        strategies/
          jwt.strategy.ts
          local.strategy.ts
      users/
        users.module.ts
        users.controller.ts
        users.service.ts
        schemas/
          user.schema.ts
      jobs/
        jobs.module.ts
        jobs.controller.ts
        jobs.service.ts
        schemas/
          job.schema.ts
      quiz/
        quiz.module.ts
        quiz.controller.ts
        quiz.service.ts
        quiz-attempt.service.ts
        schemas/
          quiz.schema.ts
          quiz-attempt.schema.ts
      course/
        course.module.ts
        course.controller.ts
        course.service.ts
        schemas/
          course.schema.ts
          module.schema.ts
      progress/
        progress.module.ts
        progress.service.ts
        schemas/
          progress.schema.ts
      cv/
        cv.module.ts
        cv.controller.ts
        cv.service.ts
        templates/
          cv-template.hbs
      leaderboard/
        leaderboard.module.ts
        leaderboard.controller.ts
        leaderboard.service.ts
      admin/
        admin.module.ts
        admin.controller.ts
        admin.service.ts
      storage/
        storage.module.ts
        storage.service.ts         # Firebase Storage wrapper
```

---

## 3. RBAC Design

### Role Enum
```typescript
enum Role {
  APPLICANT = 'applicant',
  EMPLOYER  = 'employer',
  ADMIN     = 'admin',
}
```

### Guard Chain
Every protected endpoint passes through:
1. `JwtAuthGuard` - validates Bearer token
2. `RolesGuard` - checks `user.role` against `@Roles()` decorator

### Privilege Hierarchy
```
Admin > Employer > Applicant
```

Admin can access all Employer and Applicant endpoints.
Employer cannot access Applicant-scoped resources (other users' quiz attempts).
Applicant cannot access Employer or Admin endpoints at all.

---

## 4. Quiz Attempt State Machine

```
NOT_STARTED
    |
    v (take quiz)
ATTEMPTED
    |
    +---> PASSED (score >= threshold)
    |         |
    |         v
    |     APPLICATION_SENT
    |
    +---> FAILED (score < threshold)
              |
              v
          GROOMING_REQUIRED
              |
              v (complete all course modules)
          GROOMING_COMPLETE
              |
              v (take final quiz attempt)
          FINAL_ATTEMPTED
              |
              +---> FINAL_PASSED
              |
              +---> FINAL_FAILED -> LOCKED (no more attempts)
```

### State Invariants
- A user can only have ONE QuizAttempt document per (userId, jobId) pair
- State transitions are forward-only and validated server-side
- The `LOCKED` state cannot be reversed without admin intervention

---

## 5. CV Generation Strategy

### Chosen Library: **Puppeteer + Handlebars**

**Rationale:**
- Handlebars allows clean HTML templates with `{{applicant.name}}` bindings
- Puppeteer renders the HTML to pixel-perfect PDF
- Fallback: `pdfmake` if Puppeteer memory issues arise in serverless

### Template Data Shape
```typescript
interface CVTemplateData {
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  quizScores: { jobTitle: string; company: string; score: number; }[];
  generatedAt: string;
}
```

### Storage Flow
1. Applicant profile updated -> invalidate cached CV
2. `GET /cv/:applicantId` called by employer
3. Check Firebase Storage for existing PDF
4. If missing or stale: render template -> PDF -> upload -> return signed URL
5. Signed URL expires in 1 hour (employer downloads it)

---

## 6. Cloud Storage Structure (Firebase Storage)

```
skillverify-storage/
  grooming/
    {courseId}/
      {moduleId}/
        video.mp4
        worksheet.pdf
  cvs/
    {applicantId}/
      cv_v{version}.pdf
  profile-photos/
    {userId}/
      avatar.jpg
```

---

## 7. Frontend Architecture Decisions

### Framework: **React 18 + Vite + TypeScript**
- Vite for fast HMR in development
- React Router v6 for declarative routing
- React Query (TanStack Query) for server state management + caching
- Zustand for lightweight client state (auth, role, UI state)
- TailwindCSS + shadcn/ui for component system

### Monorepo Structure
```
skillverify/
  frontend/               # React app
    src/
      pages/
        applicant/        # Applicant-role pages
        employer/         # Employer-role pages
        admin/            # Admin-role pages
        auth/             # Login, Register
      components/
        shared/           # Reusable across all roles
        quiz/             # QuizCard, QuestionRenderer, Timer
        leaderboard/      # LeaderboardTable, RankCard
        cv/               # CVPreview
        course/           # ModuleList, VideoPlayer, ProgressBar
      hooks/
        useAuth.ts
        useQuiz.ts
        useProgress.ts
      api/                # Axios client + endpoint functions
      types/              # Mirror of /shared/types
      context/
        AuthContext.tsx
  backend/                # NestJS app
  shared/
    types/                # Canonical TypeScript interfaces (from gemini.md)
```

---

## 8. Technical Constraints

| Constraint | Detail |
|---|---|
| Quiz question count | Minimum 10, maximum 20 per job |
| Passing threshold | Configurable per job (default: 70%) |
| Max quiz attempts | 2 (1 initial + 1 final after grooming) |
| Grooming prerequisite | ALL modules must be marked complete |
| CV manual uploads | FORBIDDEN - CV is always auto-generated |
| Leaderboard scope | Strictly per (companyId, jobId) - no cross-role comparison |
| Admin audit trail | Required for all destructive actions |
| File size limits | Videos: 500 MB max; PDFs/worksheets: 20 MB max |

---

## 9. Environment Variables Required

```env
# Backend (.env)
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_STORAGE_BUCKET=...

# Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:3001/api
```
