// app/page.tsx
import fs from "fs";
import path from "path";
import Gallery from "./Gallery";
import { GLOBAL_IMAGE_ORDER } from "./globalOrder";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function applyGlobalOrder(images: string[]): string[] {
  if (!GLOBAL_IMAGE_ORDER.length) return images;
  const valid = new Set(images);
  const ordered: string[] = [];
  for (const src of GLOBAL_IMAGE_ORDER) {
    if (valid.has(src)) ordered.push(src);
  }
  for (const src of images) {
    if (!ordered.includes(src)) ordered.push(src);
  }
  return ordered;
}

export default function Page() {
  const contentDir = path.join(process.cwd(), "public/content");

  const baseImages = fs
    .readdirSync(contentDir)
    .filter((file) => !file.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => `${BASE_PATH}/content/${file}`);

  return <Gallery images={applyGlobalOrder(baseImages)} />;
}
