import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { Services } from '@/components/sections/Services';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedListings />
        <Services />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
