// Work history, newest first. Taken from Abhimanyu_Singh_Resume.pdf; keep this
// file and the resume in sync when either changes.
//
// Shape: { company, role, start, end, link, points: [] }
// `end: 'Present'` marks the current role.

export const experience = [
  {
    company: 'Mextropic AI',
    role: 'Full-Stack Developer Intern',
    start: 'Sep 2026',
    end: 'Present',
    link: '',
    points: [
      'Built and deployed the company website for an AI drug-discovery data startup using React, Vite and an Express API running as a Vercel serverless function.',
      'Developed REST endpoints for the data catalogue, campaign data and a rate-limited enquiry form, with request-size limits and CORS rules.',
      'Turned Figma designs into responsive React components, and shipped a second minimalist design variant for stakeholder review.',
    ],
  },
  {
    company: 'SuprSchool',
    role: 'Full-Stack Developer',
    start: 'Apr 2026',
    end: 'Aug 2026',
    link: '',
    points: [
      'Shipped features and fixes for a teacher and student school app built with Expo (React Native) and a TypeScript Express API on Supabase (PostgreSQL), released to iOS through TestFlight.',
      'Fixed real-time notification delivery end to end: repaired the Postgres-queue worker that crashed on its first message, built the realtime channel the client subscribed to, and routed events, assignments and diary posts to the right classes.',
      "Wrote contract tests that check every client API call against the server's routes, catching two endpoints the backend never served; added request timeouts, cursor pagination and idempotency keys.",
      'Reduced iOS releases to a single command with EAS Build/Submit profiles, and fixed keyboard avoidance, safe-area insets, pull-to-refresh and duplicate network fetches across tabs.',
    ],
  },
  {
    company: 'Bunkout',
    role: 'Full-Stack Developer',
    start: 'Jan 2026',
    end: 'Mar 2026',
    link: 'https://bunkout.in',
    points: [
      'Built the Next.js website for Bunkout, a stays and hospitality brand with 52K+ Instagram followers, presenting property listings, room galleries and menus.',
      'Designed an admin dashboard for managing listings and site content.',
    ],
  },
];

export const education = [
  {
    school: 'MIT Art, Design and Technology University',
    degree: 'B.Tech in Computer Science and Engineering',
    location: 'Pune, India',
    end: 'Expected 2028',
  },
];
