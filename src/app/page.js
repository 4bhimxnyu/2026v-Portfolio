import SiteNav from '@/components/SiteNav/SiteNav';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import Capabilities from '@/components/Capabilities/Capabilities';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Capabilities />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
