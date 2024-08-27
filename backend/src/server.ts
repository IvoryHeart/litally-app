import app from './app';
import logger from './shared/utils/logger';
import { Server } from 'http';

export function startServer(port: number | string = process.env.PORT || 3000): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}