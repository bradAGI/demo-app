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
  console.error(`[${new Date().toISOString()}] Uncaught Exception:`, err);
  if (server) {
    server.close(() => process.exit(1));
  }
  setTimeout(() => process.exit(1), 5000).unref();
});

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', authRouter);

app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}] Route error:`, err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await initDb();
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });

  function shutdown(signal) {
    console.log(`Received ${signal}, shutting down gracefully...`);
    const forceExit = setTimeout(() => {
      console.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);
    forceExit.unref();
    server.close(async () => {
      try {
        await client.end();
        console.log('Database connection closed.');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
      clearTimeout(forceExit);
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
