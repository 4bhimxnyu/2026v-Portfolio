// Publishes the resume from ./Resume (the folder you edit) into public/resume/
// (the folder Next.js serves). Runs before `dev` and `build`.
//
// - The PDF is copied under a fixed name, so links never have to change.
// - Page 1 is rendered to preview.webp for the interactive paper in the Resume
//   section, so the preview always matches the PDF you ship.
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = 'Resume';
const TARGET_DIR = path.join('public', 'resume');
const TARGET_PDF = path.join(TARGET_DIR, 'Abhimanyu_Singh_Resume.pdf');
const TARGET_PREVIEW = path.join(TARGET_DIR, 'preview.webp');
const PREVIEW_WIDTH = 1000;

const pdfs = fs.existsSync(SOURCE_DIR)
  ? fs.readdirSync(SOURCE_DIR).filter(name => name.toLowerCase().endsWith('.pdf'))
  : [];

if (pdfs.length === 0) {
  console.warn(`[resume] No PDF in ./${SOURCE_DIR}; the resume links will show as unavailable.`);
  fs.rmSync(TARGET_PDF, { force: true });
  fs.rmSync(TARGET_PREVIEW, { force: true });
  process.exit(0);
}

if (pdfs.length > 1) console.warn(`[resume] Several PDFs in ./${SOURCE_DIR}; using ${pdfs[0]}.`);
fs.mkdirSync(TARGET_DIR, { recursive: true });
fs.copyFileSync(path.join(SOURCE_DIR, pdfs[0]), TARGET_PDF);
console.log(`[resume] ${pdfs[0]} -> ${TARGET_PDF}`);

// The preview is a nice-to-have: if rendering fails, the site falls back to a
// plain paper sheet and the build carries on.
try {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');

  const data = new Uint8Array(fs.readFileSync(TARGET_PDF));
  const task = getDocument({ data, verbosity: 0 });
  const doc = await task.promise;
  const page = await doc.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: PREVIEW_WIDTH / base.width });

  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  fs.writeFileSync(TARGET_PREVIEW, await canvas.encode('webp', 88));
  console.log(`[resume] page 1 -> ${TARGET_PREVIEW} (${canvas.width}x${canvas.height})`);
  await task.destroy();
} catch (error) {
  console.warn(`[resume] Could not render the preview image: ${error.message}`);
  fs.rmSync(TARGET_PREVIEW, { force: true });
}
