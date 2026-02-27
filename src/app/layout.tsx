import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skyline Realty | AI-Powered Real Estate in Seattle',
  description:
    'Find your dream home in Seattle with Skyline Realty. Our AI assistant helps you discover properties, schedule showings, and get answers 24/7.',
  openGraph: {
    title: 'Skyline Realty | AI-Powered Real Estate in Seattle',
    description:
      'Find your dream home in Seattle with Skyline Realty. Our AI assistant helps you discover properties, schedule showings, and get answers 24/7.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
