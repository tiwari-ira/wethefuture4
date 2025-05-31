const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const uri = process.env.MONGODB_URI || 'your_mongodb_connection_string';
let client = null;
let db = null;

async function connectToDatabase() {
  if (db) return db;
  
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    });
    await client.connect();
  }
  
  db = client.db('typeracer');
  return db;
}

// Get leaderboard entries for a specific mode
async function getLeaderboard(mode) {
  try {
    const database = await connectToDatabase();
    const entries = await database.collection('leaderboard')
      .find({ mode })
      .sort({ wpm: -1 })
      .limit(10)
      .toArray();
    return entries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

// Add a new entry to the leaderboard
async function addToLeaderboard(mode, name, wpm, accuracy, time) {
  try {
    const database = await connectToDatabase();
    await database.collection('leaderboard').insertOne({
      mode,
      name,
      wpm,
      accuracy,
      time,
      timestamp: new Date()
    });
    
    // Get updated leaderboard
    return getLeaderboard(mode);
  } catch (error) {
    console.error('Error adding to leaderboard:', error);
    return [];
  }
}

// Close the database connection when the serverless function is done
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  getLeaderboard,
  addToLeaderboard,
  closeConnection
}; 