'use client';

import { useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { Services } from '@/components/sections/Services';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';
import { ChatWidget, type ChatWidgetHandle } from '@/components/chat/ChatWidget';

export default function Home() {
  const chatRef = useRef<ChatWidgetHandle>(null);

  const openChat = () => chatRef.current?.open();

  return (
    <>
      <Navbar onOpenChat={openChat} />
      <main>
        <Hero onOpenChat={openChat} />
        <FeaturedListings />
        <Services />
        <Stats />
        <Testimonials />
        <CTA onOpenChat={openChat} />
      </main>
      <Footer />
      <ChatWidget ref={chatRef} />
    </>
  );
}
