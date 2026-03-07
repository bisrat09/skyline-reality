'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { label: 'Properties', href: '#properties' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

interface NavbarProps {
  onOpenChat?: () => void;
}

export function Navbar({ onOpenChat }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-sm'
          : 'bg-transparent'
      )}
    >
      <Container>
        <nav className="flex items-center justify-between h-16 md:h-20">
          <a href="#" aria-label="Home">
            <Logo variant={isScrolled ? 'dark' : 'light'} size="md" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isScrolled
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
              </a>
            ))}
            <Button variant="compass" size="sm" onClick={onOpenChat}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg
              className={cn('h-6 w-6', isScrolled ? 'text-gray-700' : 'text-white')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </Container>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenChat={onOpenChat}
        links={navLinks}
      />
    </header>
  );
}
