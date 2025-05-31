const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const uri = process.env.MONGODB_URI || 'your_mongodb_connection_string';
let client = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

async function getDb() {
  const client = await getClient();
  return client.db('typeracer');
}

// Get leaderboard entries for a specific mode
async function getLeaderboard(mode) {
  const db = await getDb();
  const entries = await db.collection('leaderboard')
    .find({ mode })
    .sort({ wpm: -1 })
    .limit(10)
    .toArray();
  return entries;
}

// Add a new entry to the leaderboard
async function addToLeaderboard(mode, name, wpm, accuracy, time) {
  const db = await getDb();
  await db.collection('leaderboard').insertOne({
    mode,
    name,
    wpm,
    accuracy,
    time,
    timestamp: new Date()
  });
  
  // Get updated leaderboard
  return getLeaderboard(mode);
}

module.exports = {
  getLeaderboard,
  addToLeaderboard
}; 