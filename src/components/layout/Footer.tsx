import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/ui/Container';

const footerLinks = {
  properties: [
    { label: 'Browse Listings', href: '#properties' },
    { label: 'New Construction', href: '#' },
    { label: 'Open Houses', href: '#' },
    { label: 'Market Reports', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Team', href: '#' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Careers', href: '#' },
  ],
  support: [
    { label: 'Contact', href: '#contact' },
    { label: 'FAQ', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 border-t border-gray-200">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Logo variant="dark" size="lg" />
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                AI-powered real estate in Seattle. Find your dream home with instant 24/7 assistance.
              </p>
            </div>

            {/* Properties */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Properties
              </h3>
              <ul className="space-y-2">
                {footerLinks.properties.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Skyline Realty. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Powered by AI &mdash; Seattle, WA
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
