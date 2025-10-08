import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
