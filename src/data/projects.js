// Selected work. Only projects with `featured: true` are shown on the page.
// Fill in the empty fields with real details; empty values are simply not rendered.
//
// Shape:
// {
//   slug, name, featured,
//   category,      e.g. 'Product design', 'Web app'
//   role,          e.g. 'Design & frontend'
//   year,          e.g. '2025'
//   description,   one or two sentences, in your own words
//   technologies,  e.g. ['Next.js', 'Three.js']
//   image,         path in /public, e.g. '/work/bunkout.jpg'
//   link,          live project URL
//   caseStudy,     case study URL
// }

const project = (slug, name, featured, details = {}) => ({
  slug,
  name,
  featured,
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
  project('bunkout', 'Bunkout', true),
  project('docugenius', 'DocuGenius', true),
  project('quantra-ai', 'Quantra AI', true),
  project('flowboard', 'FlowBoard', true),
  project('cribfind', 'CribFind', true),
  project('fitpro', 'FitPro', true),
  project('wasabi', 'Wasabi', false),
  project('x1-studios', 'X1 Studios', false),
  project('breeze-ai-saas', 'Breeze AI SaaS', false),
  project('srum', 'SRUM', false),
];

export const featuredProjects = projects.filter(p => p.featured);
