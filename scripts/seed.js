// scripts/seed.js
// Seeds demo accounts, job circulars, 10-question quizzes, and grooming courses for SkillVerify

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function getUri() {
  const envUri = process.env.MONGODB_URI;
  if (envUri && !envUri.includes('127.0.0.1') && !envUri.includes('localhost')) {
    return envUri;
  }
  try {
    const testConn = await mongoose.createConnection(envUri || 'mongodb://127.0.0.1:27017/skillverify', {
      serverSelectionTimeoutMS: 1500,
    }).asPromise();
    await testConn.close();
    return envUri || 'mongodb://127.0.0.1:27017/skillverify';
  } catch {
    console.log('⚡ Local MongoDB not active. Launching embedded in-memory server for seeding...');
    const mongod = await MongoMemoryServer.create();
    return mongod.getUri();
  }
}

async function seed() {
  const uri = await getUri();
  console.log(`🌱 Connecting to database (${uri.includes('127.0.0.1') ? 'local' : 'in-memory / cloud'})...`);
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const usersCollection = db.collection('users');
  await usersCollection.deleteMany({});

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'admin@skillverify.com',
    passwordHash,
    role: 'admin',
    status: 'active',
    fullName: 'System Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const employerUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'employer@google.com',
    passwordHash,
    role: 'employer',
    status: 'active',
    companyName: 'Google LLC',
    companyWebsite: 'https://careers.google.com',
    contactPerson: 'Sarah Jenkins (Lead Recruiter)',
    phone: '+1 650-253-0000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const applicantUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'applicant@skillverify.com',
    passwordHash,
    role: 'applicant',
    status: 'active',
    fullName: 'Alex Mercer',
    phone: '+880 1711-223344',
    headline: 'Senior Full-Stack React & Node.js Engineer',
    skills: ['React', 'TypeScript', 'Node.js', 'NestJS', 'MongoDB', 'TailwindCSS'],
    education: [
      {
        institution: 'United International University',
        degree: 'B.Sc. in Computer Science',
        fieldOfStudy: 'Software Engineering',
        startYear: 2020,
        endYear: 2024,
        isCurrent: false,
      },
    ],
    experience: [
      {
        company: 'TechFlow Systems',
        title: 'Full-Stack Developer',
        description: 'Developed scalable microservices and high-performance React frontends.',
        startDate: '2024-01-01',
        isCurrent: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await usersCollection.insertMany([adminUser, employerUser, applicantUser]);

  const jobsCollection = db.collection('jobs');
  const quizzesCollection = db.collection('quizzes');
  const coursesCollection = db.collection('courses');

  await jobsCollection.deleteMany({});
  await quizzesCollection.deleteMany({});
  await coursesCollection.deleteMany({});

  const sampleJobId = new mongoose.Types.ObjectId();
  const sampleQuizId = new mongoose.Types.ObjectId();
  const sampleCourseId = new mongoose.Types.ObjectId();

  const sampleJob = {
    _id: sampleJobId,
    employerId: employerUser._id,
    companyName: 'Google LLC',
    title: 'Senior Frontend Engineer (React & TypeScript)',
    description: 'We are looking for a Senior Frontend Engineer to build high-performance web applications using React, TypeScript, and modern component systems.\n\nKey Responsibilities:\n• Architect scalable client-side features.\n• Collaborate with product and design teams.\n• Maintain strict performance and accessibility standards.',
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'REST APIs', 'State Management'],
    location: 'Mountain View, CA (Hybrid / Remote Available)',
    salaryRange: { min: 140000, max: 185000, currency: 'USD' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    quizId: sampleQuizId,
    courseId: sampleCourseId,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleQuiz = {
    _id: sampleQuizId,
    jobId: sampleJobId,
    employerId: employerUser._id,
    passingScore: 70,
    timeLimit: 15,
    questions: [
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'What is the primary benefit of React Virtual DOM reconciliation (Fiber)?',
        options: [
          'Direct manipulation of browser memory without CPU overhead',
          'Diffing virtual representations to minimize expensive real DOM mutations',
          'Automatic translation of JavaScript to C++ assembly',
          'Eliminating all need for state management libraries',
        ],
        correctIndex: 1,
        explanation: 'The Fiber reconciliation algorithm diffs trees and applies minimal DOM updates in batches.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
        options: ['Required<T>', 'Readonly<T>', 'Partial<T>', 'Record<K, T>'],
        correctIndex: 2,
        explanation: 'Partial<T> marks all properties in T as optional.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'In React 18, what does automatic batching do?',
        options: [
          'Batches state updates inside promises, timeouts, and native event handlers together',
          'Runs all useEffect hooks in parallel web workers',
          'Pre-renders components during idle network cycles',
          'Combines CSS classes into a single hash',
        ],
        correctIndex: 0,
        explanation: 'React 18 batches multiple state updates regardless of origin to reduce re-renders.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'What is the purpose of the `useCallback` hook in React?',
        options: [
          'To run side effects after layout paint',
          'To cache calculation results of expensive functions',
          'To memoize a callback function instance between renders',
          'To directly mutate ref values synchronously',
        ],
        correctIndex: 2,
        explanation: 'useCallback returns a memoized version of the callback that only changes when dependencies change.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'Which HTTP method should be idempotent and used to replace an existing resource completely?',
        options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
        correctIndex: 1,
        explanation: 'PUT is designed for idempotent complete replacements.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'In CSS Grid, what does `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` accomplish?',
        options: [
          'Creates fixed 250px columns regardless of viewport width',
          'Creates a responsive grid that automatically wraps columns without media queries',
          'Restricts total grid height to 250px',
          'Forces exactly 4 equal columns on all screens',
        ],
        correctIndex: 1,
        explanation: 'auto-fit with minmax generates intrinsic responsive wrapping.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'How should sensitive environment variables such as JWT private secrets be handled in frontend React apps?',
        options: [
          'Committed into Git for version tracking',
          'Stored exclusively on the backend server and never exposed in client bundles',
          'Encrypted with Base64 in index.html',
          'Stored in localStorage for quick client access',
        ],
        correctIndex: 1,
        explanation: 'Client-side code is publicly inspectable; secrets must stay on secure backend servers.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'What does the NestJS `@UseGuards(RolesGuard)` decorator execute before the route handler?',
        options: [
          'Database migrations',
          'Authorization verification checking user roles against required metadata',
          'Automatic response JSON compression',
          'Global CSS prefixing',
        ],
        correctIndex: 1,
        explanation: 'Guards determine whether a given request will be handled by the route handler based on permissions.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'What is the consequence of modifying React state directly instead of calling setState / dispatch?',
        options: [
          'React throws a compile-time syntax exception',
          'Component does not trigger a re-render and UI state becomes inconsistent',
          'The browser tab crashes due to stack overflow',
          'State automatically reverts to initial values after 500ms',
        ],
        correctIndex: 1,
        explanation: 'Direct mutations do not notify React reconciliation, leading to missed renders and state desync.',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        text: 'What is the time complexity of looking up a key in a standard JavaScript Map / Hash table on average?',
        options: ['O(n^2)', 'O(log n)', 'O(1)', 'O(n)'],
        correctIndex: 2,
        explanation: 'Hash table key lookups operate in constant time O(1) on average.',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleCourse = {
    _id: sampleCourseId,
    jobId: sampleJobId,
    employerId: employerUser._id,
    title: 'Google Frontend Architecture & Core Mastery',
    description: 'Mandatory preparation curriculum covering Fiber reconciliation, performance profiling, and modern TypeScript architecture.',
    modules: [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Module 1: React 18 Fiber & Concurrent Rendering',
        type: 'text',
        order: 1,
        content: {
          text: 'Fiber is Reacts core reconciliation engine. It enables incremental rendering across multiple frames.',
        },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Module 2: TypeScript Advanced Type-Level Programming',
        type: 'text',
        order: 2,
        content: {
          text: 'Mastering utility types, conditional types, and generics.',
        },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Module 3: Web Performance Profiling & Optimization',
        type: 'text',
        order: 3,
        content: {
          text: 'Core Web Vitals Optimization Checklist: LCP, INP, and CLS tuning.',
        },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await jobsCollection.insertOne(sampleJob);
  await quizzesCollection.insertOne(sampleQuiz);
  await coursesCollection.insertOne(sampleCourse);

  console.log('✅ Job Circular, 10-Question Quiz, and Grooming Course Seeded');
  console.log('------------------------------------------------------------');
  console.log('🎉 Seed complete! Default test credentials:');
  console.log('------------------------------------------------------------');
  console.log('👤 APPLICANT:');
  console.log('   Email:    applicant@skillverify.com');
  console.log('   Password: Password123!');
  console.log('');
  console.log('🏢 EMPLOYER:');
  console.log('   Email:    employer@google.com');
  console.log('   Password: Password123!');
  console.log('');
  console.log('🛡️ ADMIN:');
  console.log('   Email:    admin@skillverify.com');
  console.log('   Password: Password123!');
  console.log('------------------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err.message);
  process.exit(1);
});
