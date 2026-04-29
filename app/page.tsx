// app/page.tsx
import fs from "fs";
import path from "path";
import sharp from "sharp";
import Gallery from "./Gallery";
import { GLOBAL_IMAGE_ORDER } from "./globalOrder";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const VIDEO_EXTENSIONS = new Set([".mov", ".mp4", ".webm"]);

interface MediaItem {
  src: string;
  width?: number;
  height?: number;
}

function applyGlobalOrder(images: MediaItem[]): MediaItem[] {
  if (!GLOBAL_IMAGE_ORDER.length) return images;
  const bySrc = new Map(images.map((item) => [item.src, item]));
  const ordered: MediaItem[] = [];
  for (const src of GLOBAL_IMAGE_ORDER) {
    const item = bySrc.get(src);
    if (item) ordered.push(item);
  }
  for (const item of images) {
    if (!ordered.some((existing) => existing.src === item.src)) ordered.push(item);
  }
  return ordered;
}

export default async function Page() {
  const contentDir = path.join(process.cwd(), "public/content");

  const baseImages = await Promise.all(
    fs
    .readdirSync(contentDir)
    .filter((file) => !file.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
      .map(async (file): Promise<MediaItem> => {
        const src = `${BASE_PATH}/content/${file}`;
        const ext = path.extname(file).toLowerCase();
        if (VIDEO_EXTENSIONS.has(ext)) return { src };

        try {
          const metadata = await sharp(path.join(contentDir, file)).metadata();
          return { src, width: metadata.width, height: metadata.height };
        } catch {
          return { src };
        }
      }),
  );

  return <Gallery images={applyGlobalOrder(baseImages)} />;
}
