import { startApplication } from './server.bootstrap';

if (process.env.NODE_ENV !== 'test') {
  startApplication();
}
