import fs from 'node:fs';
import path from 'node:path';
import SiteNav from '@/components/SiteNav/SiteNav';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Experience from '@/components/Experience/Experience';
import Projects from '@/components/Projects/Projects';
import Skills from '@/components/Skills/Skills';
import Groove from '@/components/Groove/Groove';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';
import { site } from '@/config/site';

// Files published by scripts/prepare-assets.mjs. Checked at build time (and on
// every request in dev), so nothing links to a file that isn't there.
const publicFile = file => fs.existsSync(path.join(process.cwd(), 'public', file));
const findAvatar = () =>
  site.avatar || ['jpg', 'jpeg', 'png', 'webp'].map(ext => `/images/avatar.${ext}`).find(publicFile) || '';

export default function Home() {
  const resumeHref = publicFile(site.resume) ? site.resume : null;
  const previewSrc = publicFile(site.resumePreview) ? site.resumePreview : null;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav resumeHref={resumeHref} previewSrc={previewSrc} />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Groove />
        <Contact avatarUrl={findAvatar()} />
      </main>
      <Footer />
    </>
  );
}
