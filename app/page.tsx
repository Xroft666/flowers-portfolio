// app/page.tsx
import fs from "fs";
import path from "path";
import Gallery from "./Gallery";

export default function Page() {
  const contentDir = path.join(process.cwd(), "public/content");

  const baseImages = fs
    .readdirSync(contentDir)
    .filter((file) => !file.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => `/content/${file}`);

  return <Gallery images={baseImages} />;
}
