// Single place for personal details. Everything marked TODO is a placeholder
// that needs a real value before the site goes live.
export const site = {
  name: 'Abhimanyu Singh',
  role: 'Full Stack Developer',
  statement: 'I build products end to end, from the interface people use to the systems that run it.',
  description:
    'Abhimanyu Singh is a full stack developer who builds products end to end, from the interface to the systems behind it.',

  handle: '4bhimxnyu',
  // Shown on the Contact profile card. Kept factual (current role from the resume);
  // change it to e.g. 'Open to work' only if that is true.
  status: 'Intern at Mextropic AI',
  // Profile photo for the Contact card. Easiest: drop avatar.jpg/png/webp into
  // src/assets/ and leave this empty; it is picked up automatically. Set a path
  // here only to override that. No photo: the card shows initials.
  avatar: '',

  // Web3Forms access key: contact-form messages are emailed to the address the
  // key was created with. Get one free at https://web3forms.com (enter your
  // email; the key arrives in your inbox). Safe to commit: keys are public by
  // design. Or set NEXT_PUBLIC_WEB3FORMS_KEY in Vercel instead.
  // Empty = the form opens the visitor's own email app (mailto) instead.
  web3formsKey: '9c8866e5-bdb9-49ba-b5fd-f0ea423d9aaf',

  // From the resume header.
  email: 'abhimanyupratapsingh30nov1106@gmail.com',

  // Resume PDF. Edit the file in ./Resume; scripts/prepare-assets.mjs copies it to
  // this path before every dev/build. If ./Resume has no PDF, the navbar shows a
  // disabled "Resume" placeholder instead of a dead link.
  // Same-origin path: in production this is
  // https://4bhimxnyu.vercel.app/resume/Abhimanyu_Singh_Resume.pdf
  resume: '/resume/Abhimanyu_Singh_Resume.pdf',
  // Page 1 of the PDF, rendered by the same script, used by the resume pop-up.
  resumePreview: '/resume/preview.webp',

  // Remove an entry to hide it everywhere it appears (Contact and Footer).
  links: [
    { label: 'GitHub', href: 'https://github.com/4bhimxnyu' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/4bhimxnyu/' },
    { label: 'Behance', href: 'https://www.behance.net/abhimanyusingh92' },
  ],

  // Hero image rendered through DitherVeil. Any CORS-enabled image URL or a file in /public works.
  heroImage:
    'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop',
};
