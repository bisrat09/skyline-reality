'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 md:hidden transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/50" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-72 bg-white shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Logo variant="dark" size="sm" />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-4 py-3 text-navy-700 font-medium rounded-lg hover:bg-navy-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button variant="gold" className="w-full" onClick={onClose}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
