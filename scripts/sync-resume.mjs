// Copies the resume PDF from ./Resume (the folder you edit) into
// public/resume/ (the folder Next.js serves). Runs before `dev` and `build`.
// Whatever the PDF in ./Resume is called, it is published under the fixed
// name below, so the Resume button link never has to change.
import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIR = 'Resume';
const TARGET = path.join('public', 'resume', 'Abhimanyu_Singh_Resume.pdf');

const pdfs = fs.existsSync(SOURCE_DIR)
  ? fs.readdirSync(SOURCE_DIR).filter(name => name.toLowerCase().endsWith('.pdf'))
  : [];

if (pdfs.length === 0) {
  console.warn(`[resume] No PDF in ./${SOURCE_DIR}; the Resume button will show as unavailable.`);
  fs.rmSync(TARGET, { force: true });
} else {
  if (pdfs.length > 1) console.warn(`[resume] Several PDFs in ./${SOURCE_DIR}; using ${pdfs[0]}.`);
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.copyFileSync(path.join(SOURCE_DIR, pdfs[0]), TARGET);
  console.log(`[resume] ${pdfs[0]} -> ${TARGET}`);
}
