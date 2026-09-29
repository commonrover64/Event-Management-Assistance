import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './lib/db';
import { logger } from './lib/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);

  const server = createApp().listen(env.PORT, (error) => {
    if (error) {
      logger.fatal({ err: error }, 'Failed to bind port');
      process.exit(1);
    }
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info(`${signal} received, shutting down`);
    // Stop accepting connections, let in-flight requests finish, then close the db
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err: unknown) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
