import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { generateSeedData } from './seed-data';

let mongod: MongoMemoryServer | null = null;

export async function getDatabaseUri(): Promise<string> {
  const envUri = process.env.MONGODB_URI;

  if (envUri && !envUri.includes('127.0.0.1') && !envUri.includes('localhost')) {
    return envUri;
  }

  // Test if local MongoDB is running
  try {
    const testConn = await mongoose.createConnection(envUri || 'mongodb://127.0.0.1:27017/skillverify', {
      serverSelectionTimeoutMS: 1500,
    }).asPromise();
    await testConn.close();
    console.log('✅ Connected to local MongoDB instance.');
    return envUri || 'mongodb://127.0.0.1:27017/skillverify';
  } catch {
    console.log('⚡ Local MongoDB not active. Launching embedded In-Memory MongoDB Server...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(`🚀 In-Memory MongoDB Server online at: ${uri}`);
    await autoSeedDatabase(uri);
    return uri;
  }
}

export async function autoSeedDatabase(uri: string) {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const db = conn.db;

    const usersCollection = db.collection('users');
    const existing = await usersCollection.countDocuments();
    if (existing > 0) {
      await conn.close();
      return;
    }

    const { users, jobs, quizzes, courses } = await generateSeedData();

    await usersCollection.insertMany(users);
    await db.collection('jobs').insertMany(jobs);
    await db.collection('quizzes').insertMany(quizzes);
    await db.collection('courses').insertMany(courses);

    await conn.close();
    console.log('✅ Demo accounts & sample data auto-seeded into database.');
  } catch (err: any) {
    console.warn(`Auto-seed warning: ${err.message}`);
  }
}
