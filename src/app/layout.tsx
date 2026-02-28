import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skyline Realty | AI-Powered Real Estate in Seattle',
  description:
    'Find your dream home in Seattle with Skyline Realty. Our AI assistant helps you discover properties, schedule showings, and get answers 24/7.',
  keywords: [
    'Seattle real estate',
    'homes for sale Seattle',
    'AI real estate',
    'property search Seattle',
    'buy home Seattle',
    'Capitol Hill homes',
    'Ballard real estate',
    'Queen Anne homes',
  ],
  authors: [{ name: 'Skyline Realty' }],
  openGraph: {
    title: 'Skyline Realty | AI-Powered Real Estate in Seattle',
    description:
      'Find your dream home in Seattle with Skyline Realty. Our AI assistant helps you discover properties, schedule showings, and get answers 24/7.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Skyline Realty',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skyline Realty | AI-Powered Real Estate in Seattle',
    description:
      'Find your dream home in Seattle with AI-powered property search. 24/7 assistance, instant responses.',
  },
  robots: {
    index: true,
    follow: true,
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
