// scripts/verify-db.js
// Verifies MongoDB Atlas connectivity for SkillVerify

require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('----------------------------------------------------');
  console.log('🔍 SkillVerify [Link Phase] - Database Verification');
  console.log('----------------------------------------------------');
  
  if (!uri) {
    console.error('❌ FAIL: MONGODB_URI is not defined in .env');
    console.log('💡 Tip: Set MONGODB_URI in your .env file.');
    process.exit(1);
  }

  console.log(`📡 Connecting to MongoDB URI: ${uri.replace(/\/\/.*@/, '//<credentials>@')} ...`);
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ SUCCESS: Connected to MongoDB database: "${conn.connection.name}"`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`⚡ Ready State: ${conn.connection.readyState} (1 = Connected)`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected gracefully.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAIL: MongoDB connection failed.');
    console.error(`Error details: ${err.message}`);
    console.log('💡 Diagnostics:');
    console.log('   - If using local MongoDB, make sure mongod is running.');
    console.log('   - If using MongoDB Atlas, check your IP Whitelist in Atlas Security Network Access.');
    console.log('----------------------------------------------------');
    process.exit(1);
  }
}

testDatabaseConnection();
