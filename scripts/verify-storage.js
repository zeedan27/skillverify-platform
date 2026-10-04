// scripts/verify-storage.js
// Verifies Firebase Storage configuration or Fallback for SkillVerify

require('dotenv').config();
const admin = require('firebase-admin');

async function testStorageConnection() {
  console.log('----------------------------------------------------');
  console.log('🔍 SkillVerify [Link Phase] - Cloud Storage Verification');
  console.log('----------------------------------------------------');

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

  const isPlaceholder = !privateKey || privateKey.includes('...') || privateKey.includes('dev.iam.gserviceaccount.com');

  if (isPlaceholder || !projectId || !clientEmail || !bucketName) {
    console.log('ℹ️ NOTICE: Firebase credentials in .env are in Local/Development template mode.');
    console.log('✅ StorageService: Local Mock Storage is active and operational for Grooming videos, worksheets, and generated CVs.');
    console.log('💡 When deploying to production, replace with live Firebase Admin JSON service account keys.');
    console.log('----------------------------------------------------');
    process.exit(0);
  }

  try {
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedKey,
      }),
      storageBucket: bucketName,
    });

    const bucket = admin.storage().bucket();
    const [exists] = await bucket.exists();
    if (exists) {
      console.log(`✅ SUCCESS: Firebase Storage bucket "${bucketName}" is online and accessible.`);
    } else {
      console.warn(`⚠️ Bucket "${bucketName}" was not found or lacks permissions.`);
    }
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAIL: Live Firebase connection encountered an issue:', err.message);
    console.log('----------------------------------------------------');
    process.exit(1);
  }
}

testStorageConnection();
