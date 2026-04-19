// app/layout.js
import './globals.css';

export const metadata = {
  title: 'DC Site Screener — Data Center Siting Intelligence',
  description:
    'Eleven-axis data center site evaluation for hyperscalers, operators, and investors. Built at Columbia MSRED.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}