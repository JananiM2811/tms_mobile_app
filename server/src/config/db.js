const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticket_management';
  
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${primaryURI}...`);
    // Connect with a short timeout so we know quickly if local mongo is active
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Successfully connected to live MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB (${err.message}).`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbDir = path.resolve(__dirname, '../../.mongo-data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
        },
      });
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[DB] Persistent database initialized successfully at ${dbDir}: ${memoryUri}`);
    } catch (memErr) {
      console.error('[DB] Failed to initialize persistent database fallback:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
