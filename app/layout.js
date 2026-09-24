import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'DC Site Screener',
  description:
    'Eleven-axis data center site screening with an AI-written investment memo. Enter any US address.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}