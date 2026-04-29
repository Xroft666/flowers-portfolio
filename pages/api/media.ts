// pages/api/media.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { loadMedia } from '../../utils/loadMedia';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const media = loadMedia();
  res.status(200).json(media);
}
