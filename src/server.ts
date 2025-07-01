import app from './index';
import { serverConfig } from './config/server.config';

export function startServer() {
  return app.listen(serverConfig.port);
}
