import app from '../src/index';
import { createServer } from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const server = createServer(app);
  return server.emit('request', req, res);
}
