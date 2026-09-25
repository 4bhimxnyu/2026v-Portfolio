import { Urbanist } from 'next/font/google';
import GlobalCursor from '@/components/effects/GlobalCursor/GlobalCursor';
import { site } from '@/config/site';
import './globals.css';

// One variable font file covers every weight used on the site.
const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
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
    <html lang="en" className={urbanist.variable}>
      <body>
        {children}
        <GlobalCursor />
      </body>
    </html>
  );
}
