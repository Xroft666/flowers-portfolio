// utils/loadMedia.ts
import fs from 'fs';
import path from 'path';

export interface MediaItem {
  src: string;
  type: 'image' | 'video';
}

export function loadMedia(): MediaItem[] {
  const mediaDir = path.join(process.cwd(), 'public', 'media');
  const files = fs.readdirSync(mediaDir);

  return files.map((file) => {
    const ext = path.extname(file).toLowerCase();
    const type = ['.mp4', '.webm'].includes(ext) ? 'video' : 'image';
    return {
      src: `/media/${file}`,
      type,
    };
  });
}
