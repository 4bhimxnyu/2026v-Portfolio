// Selected work, shown in this order. Fill in the empty fields with real
// details; empty values are simply not rendered.
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
  project('mextropic', 'Mextropic'),
  project('bunkout', 'Bunkout'),
  project('docugenius', 'DocuGenius'),
  project('altself', 'AltSelf'),
];
