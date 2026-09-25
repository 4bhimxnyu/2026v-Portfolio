// Publishes files you edit into public/ (the folder Next.js serves).
// Runs before `dev` and `build`, locally and on Vercel. Output is git-ignored.
//
// 1. Profile photo: src/assets/avatar.(jpg|jpeg|png|webp) -> public/images/avatar.<ext>
//    for the Contact profile card. No photo: the card shows initials.
// 2. Resume: the PDF in ./Resume -> public/resume/, under a fixed name so links
//    never change, plus page 1 rendered to preview.webp for the resume pop-up.
import fs from 'node:fs';
import path from 'node:path';

const AVATAR_DIR = path.join('src', 'assets');
const AVATAR_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const RESUME_DIR = 'Resume';
const RESUME_OUT = path.join('public', 'resume');
const RESUME_PDF = path.join(RESUME_OUT, 'Abhimanyu_Singh_Resume.pdf');
const RESUME_PREVIEW = path.join(RESUME_OUT, 'preview.webp');
const PREVIEW_WIDTH = 1000;

function publishAvatar() {
  for (const ext of AVATAR_EXTS) fs.rmSync(path.join('public', 'images', `avatar${ext}`), { force: true });

  const file = fs.existsSync(AVATAR_DIR)
    ? fs.readdirSync(AVATAR_DIR).find(name => {
        const { name: base, ext } = path.parse(name.toLowerCase());
        return base === 'avatar' && AVATAR_EXTS.includes(ext);
      })
    : null;

  if (!file) {
    console.log('[avatar] No src/assets/avatar.(jpg|png|webp); the profile card shows initials.');
    return;
  }
  const target = path.join('public', 'images', `avatar${path.extname(file).toLowerCase()}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(AVATAR_DIR, file), target);
  console.log(`[avatar] ${file} -> ${target}`);
}

async function renderPreview() {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');

  const task = getDocument({ data: new Uint8Array(fs.readFileSync(RESUME_PDF)), verbosity: 0 });
  const doc = await task.promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: PREVIEW_WIDTH / page.getViewport({ scale: 1 }).width });

  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  fs.writeFileSync(RESUME_PREVIEW, await canvas.encode('webp', 88));
  console.log(`[resume] page 1 -> ${RESUME_PREVIEW} (${canvas.width}x${canvas.height})`);
  await task.destroy();
}

async function publishResume() {
  const pdfs = fs.existsSync(RESUME_DIR)
    ? fs.readdirSync(RESUME_DIR).filter(name => name.toLowerCase().endsWith('.pdf'))
    : [];

  if (pdfs.length === 0) {
    console.warn(`[resume] No PDF in ./${RESUME_DIR}; the Resume button will show as unavailable.`);
    fs.rmSync(RESUME_PDF, { force: true });
    fs.rmSync(RESUME_PREVIEW, { force: true });
    return;
  }
  if (pdfs.length > 1) console.warn(`[resume] Several PDFs in ./${RESUME_DIR}; using ${pdfs[0]}.`);

  fs.mkdirSync(RESUME_OUT, { recursive: true });
  fs.copyFileSync(path.join(RESUME_DIR, pdfs[0]), RESUME_PDF);
  console.log(`[resume] ${pdfs[0]} -> ${RESUME_PDF}`);

  // The preview is a nice-to-have: if rendering fails, the pop-up shows a
  // plain placeholder sheet and the build carries on.
  try {
    await renderPreview();
  } catch (error) {
    console.warn(`[resume] Could not render the preview image: ${error.message}`);
    fs.rmSync(RESUME_PREVIEW, { force: true });
  }
}

publishAvatar();
await publishResume();
