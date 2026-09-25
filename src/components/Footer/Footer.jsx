import { site } from '@/config/site';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p className={styles.credit}>Built with Next.js, Three.js and React Bits.</p>
      <a href="#home" className={styles.top}>
        Back to top
      </a>
    </footer>
  );
}
