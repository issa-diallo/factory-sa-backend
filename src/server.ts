import app from './index';
import { getServerConfig } from './config/server.config';

export function startServer() {
  const config = getServerConfig();
  return app.listen(config.port);
}
