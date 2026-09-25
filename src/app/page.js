import fs from 'node:fs';
import path from 'node:path';
import SiteNav from '@/components/SiteNav/SiteNav';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import Skills from '@/components/Skills/Skills';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';
import { site } from '@/config/site';

export default function Home() {
  // Checked at build time (and on every request in dev): the Resume button only
  // links to the PDF once public/resume.pdf actually exists.
  const resumeAvailable = fs.existsSync(path.join(process.cwd(), 'public', site.resume));

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav resumeHref={resumeAvailable ? site.resume : null} />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
