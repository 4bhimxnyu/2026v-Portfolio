import { site } from '@/config/site';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p className={styles.credit}>Built with Next.js, Three.js and React Bits.</p>
      <ul className={styles.links} aria-label="Profiles">
        {site.links.map(link => (
          <li key={link.label}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <a href="#home" className={styles.top}>
        Back to top
      </a>
    </footer>
  );
}
