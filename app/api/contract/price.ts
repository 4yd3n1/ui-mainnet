import { NextApiRequest, NextApiResponse } from 'next';

// Placeholder for optional price API proxy
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ price: null });
} 