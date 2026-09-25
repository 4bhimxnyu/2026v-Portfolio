import { Anybody, Hanken_Grotesk } from 'next/font/google';
import { site } from '@/config/site';
import './globals.css';

const anybody = Anybody({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-anybody',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

export const metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.description,
};

export const viewport = {
  themeColor: '#120f17',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anybody.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
