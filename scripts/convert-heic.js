const fs = require("fs");
const path = require("path");
const heicConvert = require("heic-convert");

async function convertHeicInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await convertHeicInDir(fullPath);
      continue;
    }

    const lower = entry.name.toLowerCase();
    if (!lower.endsWith(".heic")) continue;

    const baseName = entry.name.replace(/\.heic$/i, "");
    const jpgPath = path.join(dir, baseName + ".jpg");

    if (fs.existsSync(jpgPath)) {
      // Already converted
      continue;
    }

    console.log(`Converting ${entry.name} -> ${baseName}.jpg`);
    const inputBuffer = fs.readFileSync(fullPath);

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.9,
    });

    fs.writeFileSync(jpgPath, outputBuffer);
  }
}

async function main() {
  const contentDir = path.join(process.cwd(), "public", "content");

  if (!fs.existsSync(contentDir)) {
    console.error(`Directory not found: ${contentDir}`);
    process.exit(1);
  }

  await convertHeicInDir(contentDir);
  console.log("HEIC conversion complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

