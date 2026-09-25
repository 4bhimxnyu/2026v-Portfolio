// Selected work, shown in this order. Details come from
// Abhimanyu_Singh_Resume.pdf; empty values are simply not rendered.
//
// Shape:
// {
//   slug,          unique id, used for anchors
//   name,
//   category,      e.g. 'Web app', 'SaaS', 'Brand site'
//   role,          e.g. 'Full stack development'
//   year,          e.g. '2025'
//   description,   one or two sentences, in your own words
//   technologies,  e.g. ['Next.js', 'PostgreSQL']
//   image,         path in /public, e.g. '/work/mextropic.jpg'
//   link,          live project URL
//   caseStudy,     case study URL
// }

const project = (slug, name, details = {}) => ({
  slug,
  name,
  category: '',
  role: '',
  year: '',
  description: '',
  technologies: [],
  image: '',
  link: '',
  caseStudy: '',
  ...details,
});

export const projects = [
  project('mextropic', 'Mextropic', {
    category: 'Company website',
    role: 'Full-Stack Developer Intern',
    year: '2026',
    description:
      'The website for Mextropic AI, an AI drug-discovery data startup. Figma designs turned into responsive React components, backed by an Express API with REST endpoints for the data catalogue, campaign data and a rate-limited enquiry form.',
    technologies: ['React', 'Vite', 'Express', 'Vercel serverless functions', 'Figma'],
  }),
  project('bunkout', 'Bunkout', {
    category: 'Brand website',
    role: 'Full-Stack Developer',
    year: '2026',
    description:
      'The Next.js website for Bunkout, a stays and hospitality brand with 52K+ Instagram followers, presenting property listings, room galleries and menus, plus an admin dashboard for managing listings and site content.',
    technologies: ['Next.js'],
    link: 'https://bunkout.in',
  }),
  // Not on the resume yet: add details here when you have them.
  project('docugenius', 'DocuGenius'),
  project('altself', 'AltSelf', {
    category: 'Personal AI agent',
    role: 'UI design and web prototype',
    description:
      'Mobile and onboarding UI, plus a web prototype, for a permission-gated personal AI agent that asks for approval before each exact action.',
    technologies: ['Figma', 'React'],
  }),
];

// Smaller builds, listed under the selected work.
export const otherProjects = [
  {
    name: 'Redis Weather App',
    description:
      'A forecast service that caches Open-Meteo API responses in Redis with a 10-minute TTL and falls back gracefully when Redis is down; containerized with Docker Compose and tested in GitHub Actions CI.',
    technologies: ['Node.js', 'Express', 'Redis', 'Docker', 'GitHub Actions'],
    link: 'https://github.com/4bhimxnyu/Redis-based-weather-app.',
  },
  {
    name: 'Nexus',
    category: 'Local LLM chatbot',
    description:
      'An offline chatbot on Gemma 2B that runs on a consumer GPU (RTX 3050), using a custom Ollama Modelfile for its persona and document Q&A instructions, with no cloud APIs.',
    technologies: ['Python', 'Ollama', 'Gemma 2B'],
    link: 'https://github.com/4bhimxnyu/Nexus-Local-LLM',
  },
  {
    name: 'Shaolin Baddie',
    category: 'Browser RPG',
    description:
      'A 12-map pixel-art RPG with turn-based battles, missions and save states, generating all art and music procedurally at runtime with Canvas and Web Audio.',
    technologies: ['TypeScript', 'React 19', 'Phaser 3', 'Zustand', 'Tailwind'],
    link: 'https://github.com/4bhimxnyu/Pixel-Art-Adventure-Game.',
  },
];
