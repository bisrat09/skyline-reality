import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface HeroProps {
  onOpenChat?: () => void;
}

export function Hero({ onOpenChat }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-navy-900">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-400/10 via-transparent to-transparent" />

      <Container className="relative z-10 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-gold-400 font-medium text-sm md:text-base tracking-wider uppercase mb-4">
            AI-Powered Real Estate
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
            Find Your Dream Home in{' '}
            <span className="text-gold-400">Seattle</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
            Our AI assistant helps you discover properties, schedule showings, and get answers to your questions — 24/7, with responses in under 60 seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a href="#properties">
              <Button variant="gold" size="lg">
                Browse Properties
              </Button>
            </a>
            <Button
              variant="secondary"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={onOpenChat}
            >
              Chat with AI
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
            <div>
              <span className="text-2xl font-bold text-white">200+</span>
              <p className="mt-1">Homes Sold</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div>
              <span className="text-2xl font-bold text-white">&lt;60s</span>
              <p className="mt-1">Response Time</p>
            </div>
            <div className="h-8 w-px bg-gray-700" />
            <div>
              <span className="text-2xl font-bold text-white">24/7</span>
              <p className="mt-1">AI Available</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
