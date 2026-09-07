import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Backend Field Notes — Java interview library',
  description: 'Visual, senior-level explanations for Java and backend interviews.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${plexMono.variable} ${sourceSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
