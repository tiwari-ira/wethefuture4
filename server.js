// Utilities we need
const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});

// Enable CORS
fastify.register(require("@fastify/cors"), {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// We use a module for handling database operations
const db = require("./src/db");

// Add endpoints for the typing game
fastify.get("/api/leaderboard/:mode", async (request, reply) => {
  try {
    const mode = request.params.mode;
    const leaderboard = await db.getLeaderboard(mode);
    await db.closeConnection();
    return reply.send(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard GET:', error);
    await db.closeConnection();
    return reply.status(500).send({ error: 'Failed to fetch leaderboard' });
  }
});

fastify.post("/api/leaderboard", async (request, reply) => {
  try {
    const { mode, name, wpm, accuracy, time } = request.body;
    const result = await db.addToLeaderboard(mode, name, wpm, accuracy, time);
    await db.closeConnection();
    return reply.send(result);
  } catch (error) {
    console.error('Error in leaderboard POST:', error);
    await db.closeConnection();
    return reply.status(500).send({ error: 'Failed to save to leaderboard' });
  }
});

// Serve index.html for the root path
fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({ 
      port: process.env.PORT || 3000, 
      host: "0.0.0.0" 
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Export the server for Vercel
module.exports = fastify;

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  start();
} 