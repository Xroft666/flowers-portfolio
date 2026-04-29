const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { levels: WIDTHS } = require("../config/mip-levels.json");

const SOURCE_DIR = path.join(process.cwd(), "public", "content");
const OUTPUT_DIR = path.join(process.cwd(), "public", "content-mips");
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".WEBP",
  ".GIF",
  ".AVIF",
  ".TIF",
  ".TIFF",
  ".HEIC",
  ".HEIF",
]);

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.warn(`Skipping mip generation: source not found at ${SOURCE_DIR}`);
    return;
  }

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  for (const width of WIDTHS) {
    fs.mkdirSync(path.join(OUTPUT_DIR, String(width)), { recursive: true });
  }

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => !file.startsWith("."))
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file)));

  let generated = 0;
  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    for (const width of WIDTHS) {
      const outputPath = path.join(OUTPUT_DIR, String(width), file);
      await sharp(inputPath).rotate().resize({ width, withoutEnlargement: true }).toFile(outputPath);
      generated += 1;
    }
  }

  console.log(`Generated ${generated} mip previews for ${files.length} source images.`);
}

main().catch((error) => {
  console.error("Failed to generate mip previews.");
  console.error(error);
  process.exitCode = 1;
});
