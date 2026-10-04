import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { generateSeedData } from '../seed-data';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillverify';
  console.log(`Connecting to MongoDB at: ${uri}`);

  let conn: mongoose.Connection;
  try {
    conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log('Connected to MongoDB successfully.');
  } catch (err: any) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const db = conn.db;
  const { users, jobs, quizzes, courses } = await generateSeedData();

  console.log('\n--- Seeding Users ---');
  for (const user of users) {
    await db.collection('users').updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );
    console.log(`  [${user.role.toUpperCase()}] ${user.fullName || user.companyName} (${user.email})`);
  }

  console.log('\n--- Seeding Jobs, Quizzes & Courses ---');
  for (const job of jobs) {
    await db.collection('jobs').updateOne(
      { _id: job._id },
      { $set: job },
      { upsert: true }
    );
    console.log(`  [JOB] ${job.companyName} - "${job.title}" (${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} ${job.salaryRange.currency})`);
  }

  for (const quiz of quizzes) {
    await db.collection('quizzes').updateOne(
      { _id: quiz._id },
      { $set: quiz },
      { upsert: true }
    );
    console.log(`  [QUIZ] Job #${quiz.jobId} - ${quiz.questions.length} questions (Time limit: ${quiz.timeLimit} mins, Pass: ${quiz.passingScore}%)`);
  }

  for (const course of courses) {
    await db.collection('courses').updateOne(
      { _id: course._id },
      { $set: course },
      { upsert: true }
    );
    console.log(`  [COURSE] "${course.title}" - ${course.modules.length} interactive modules with checkpoints`);
  }

  await conn.close();
  console.log('\nDatabase seeding complete! All Bangladeshi employers, posts, quizzes, courses, and applicants are ready.\n');
}

seed().catch((e) => {
  console.error('Seed execution error:', e);
  process.exit(1);
});
