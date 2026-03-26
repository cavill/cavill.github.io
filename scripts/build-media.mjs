import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const imagesDir = path.join(rootDir, "images");
const outputDir = path.join(imagesDir, "generated");
const manifestPath = path.join(rootDir, "media-manifest.js");

const imageWidths = [480, 768, 1024, 1440, 1920];
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4"]);

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isStale(sourcePath, targetPath) {
  if (!(await fileExists(targetPath))) {
    return true;
  }

  const [sourceStat, targetStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
  ]);

  return sourceStat.mtimeMs > targetStat.mtimeMs;
}

async function listSourceFiles() {
  const dirEntries = await fs.readdir(imagesDir, { withFileTypes: true });

  return dirEntries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(imagesDir, entry.name))
    .filter((filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      return imageExtensions.has(ext) || videoExtensions.has(ext);
    })
    .sort((a, b) => a.localeCompare(b));
}

async function getVideoMetadata(filePath) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0];

  if (!stream?.width || !stream?.height) {
    throw new Error(`Could not read video metadata for ${filePath}`);
  }

  return {
    width: stream.width,
    height: stream.height,
  };
}

function publicPath(filePath) {
  return `/${path.relative(rootDir, filePath).split(path.sep).join("/")}`;
}

async function buildImage(filePath) {
  const image = sharp(filePath, { animated: true });
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.pageHeight || metadata.height;
  const isAnimated = (metadata.pages || 1) > 1;

  if (!width || !height) {
    throw new Error(`Could not read image metadata for ${filePath}`);
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  const variants = [];

  for (const targetWidth of imageWidths) {
    if (targetWidth > width) {
      continue;
    }

    const targetPath = path.join(outputDir, `${baseName}-${targetWidth}.webp`);

    if (await isStale(filePath, targetPath)) {
      await sharp(filePath, { animated: isAnimated })
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({
          quality: 72,
          effort: 5,
        })
        .toFile(targetPath);
    }

    variants.push({
      width: targetWidth,
      src: publicPath(targetPath),
    });
  }

  if (!variants.length) {
    const fallbackWidth = width;
    const targetPath = path.join(outputDir, `${baseName}-${fallbackWidth}.webp`);

    if (await isStale(filePath, targetPath)) {
      await sharp(filePath, { animated: isAnimated })
        .webp({
          quality: 72,
          effort: 5,
        })
        .toFile(targetPath);
    }

    variants.push({
      width: fallbackWidth,
      src: publicPath(targetPath),
    });
  }

  const defaultVariant =
    variants.find((variant) => variant.width >= 768) ??
    variants[variants.length - 1];

  return [
    baseName,
    {
      width,
      height,
      animated: isAnimated,
      defaultSrc: defaultVariant.src,
      sources: variants,
    },
  ];
}

async function runFfmpeg(args) {
  await execFileAsync("ffmpeg", ["-y", ...args], {
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function buildVideo(filePath) {
  const baseName = path.basename(filePath, path.extname(filePath));
  const { width, height } = await getVideoMetadata(filePath);

  const mp4TargetPath = path.join(outputDir, `${baseName}.mp4`);
  const webmTargetPath = path.join(outputDir, `${baseName}.webm`);

  if (await isStale(filePath, mp4TargetPath)) {
    await runFfmpeg([
      "-i",
      filePath,
      "-an",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale='min(1280,iw)':-2:force_original_aspect_ratio=decrease",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "28",
      mp4TargetPath,
    ]);
  }

  if (await isStale(filePath, webmTargetPath)) {
    await runFfmpeg([
      "-i",
      filePath,
      "-an",
      "-vf",
      "scale='min(1280,iw)':-2:force_original_aspect_ratio=decrease",
      "-c:v",
      "libvpx-vp9",
      "-row-mt",
      "1",
      "-b:v",
      "0",
      "-crf",
      "36",
      webmTargetPath,
    ]);
  }

  return [
    baseName,
    {
      width,
      height,
      sources: {
        mp4: publicPath(mp4TargetPath),
        webm: publicPath(webmTargetPath),
      },
    },
  ];
}

async function buildManifest() {
  await ensureDir(outputDir);

  const files = await listSourceFiles();
  const images = {};
  const videos = {};

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();

    if (imageExtensions.has(ext)) {
      const [name, config] = await buildImage(filePath);
      images[name] = config;
      continue;
    }

    if (videoExtensions.has(ext)) {
      const [name, config] = await buildVideo(filePath);
      videos[name] = config;
    }
  }

  const manifest = {
    images,
    videos,
  };

  const output =
    "window.__MEDIA_MANIFEST__ = " +
    JSON.stringify(manifest, null, 2) +
    ";\n";

  await fs.writeFile(manifestPath, output, "utf8");
}

buildManifest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
