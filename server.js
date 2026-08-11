require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app.js');
const { connectDB } = require('./config/db.js');
const initSockets = require('./config/socket.js');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

initSockets(io);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`[Server] EventPulse API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

start();

module.exports = server;