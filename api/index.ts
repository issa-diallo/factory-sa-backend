import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

export default async function apiHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  return app(req, res);
}
