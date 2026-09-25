// Skills, grouped by area, taken from the Technical Skills section of
// Abhimanyu_Singh_Resume.pdf. Add, remove, rename or reorder freely:
// - Order here is the order on the page (and the order the 3D field morphs through,
//   from the round form for the first category to the lattice for the last).
// - A category with no items shows a short "being added" note instead of a list.
// - Items are plain strings. No levels or percentages, by design.

export const skills = [
  {
    category: 'Frontend Development',
    items: ['React', 'React Native', 'Expo', 'Next.js', 'Vite', 'Tailwind CSS', 'Zustand', 'TanStack Query'],
  },
  {
    category: 'Backend Development',
    items: ['Node.js', 'Express', 'REST APIs', 'Zod', 'JWT authentication'],
  },
  {
    category: 'Databases',
    items: ['PostgreSQL', 'Supabase', 'Redis', 'MongoDB', 'Drizzle ORM'],
  },
  {
    // The resume groups these with tools; split here into infrastructure and tooling.
    category: 'DevOps & Infrastructure',
    items: ['Docker', 'GitHub Actions', 'Vercel', 'Netlify', 'EAS', 'TestFlight'],
  },
  {
    category: 'Programming Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL', 'HTML', 'CSS'],
  },
  {
    category: 'Tools & Technologies',
    items: ['Git', 'Vitest', 'Figma'],
  },
  {
    category: 'AI & ML',
    items: ['LLMs', 'Ollama', 'Claude Code (AI-assisted development)'],
  },
];
