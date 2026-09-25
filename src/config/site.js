// Single place for personal details. Everything marked TODO is a placeholder
// that needs a real value before the site goes live.
export const site = {
  name: 'Abhimanyu Singh',
  role: 'Full Stack Developer',
  statement: 'I build products end to end, from the interface people use to the systems that run it.',
  description:
    'Abhimanyu Singh is a full stack developer who builds products end to end, from the interface to the systems behind it.',

  // From the resume header.
  email: 'abhimanyupratapsingh30nov1106@gmail.com',

  // Resume PDF. Edit the file in ./Resume; scripts/sync-resume.mjs copies it to
  // this path before every dev/build. If ./Resume has no PDF, the navbar shows a
  // disabled "Resume" placeholder instead of a dead link.
  resume: '/resume/Abhimanyu_Singh_Resume.pdf',

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
