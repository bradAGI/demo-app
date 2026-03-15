const express = require('express');
const { router: authRouter } = require('./auth');
const { initDb, client } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
let server;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (server) {
    server.close(() => process.exit(1));
  }
  setTimeout(() => process.exit(1), 5000);
});

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', authRouter);

async function start() {
  await initDb();
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });

  function shutdown(signal) {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      try {
        await client.end();
        console.log('Database connection closed.');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
