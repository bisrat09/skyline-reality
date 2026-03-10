import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface HeroProps {
  onOpenChat?: () => void;
}

export function Hero({ onOpenChat }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: '#1B2A4A',
          backgroundImage:
            "linear-gradient(135deg, #1B2A4A 0%, #273c63 50%, #1B2A4A 100%), url('https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1920&h=1080&fit=crop')",
        }}
      />
      {/* Subtle dark overlay — lets the image show through warm and rich */}
      <div className="absolute inset-0 bg-black/40" />

      <Container className="relative z-10 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold-300 font-medium text-sm md:text-base tracking-wider uppercase mb-4">
            AI-Powered Real Estate
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
            Find Your Dream Home in{' '}
            <span className="text-white">Seattle</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Our AI assistant helps you discover properties, schedule showings, and get answers to your questions — 24/7, with responses in under 60 seconds.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex-1 flex items-center px-4 py-4">
                <svg
                  className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.6 10.6z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by neighborhood, address, or property type..."
                  className="w-full text-gray-700 placeholder-gray-400 outline-none text-base bg-transparent"
                  readOnly
                  onClick={onOpenChat}
                />
              </div>
              <button
                onClick={onOpenChat}
                className="bg-compass-500 text-white px-6 py-4 font-medium hover:bg-compass-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#properties">
              <Button variant="compass" size="lg">
                Browse Properties
              </Button>
            </a>
            <Button
              variant="secondary"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={onOpenChat}
            >
              Chat with AI
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-300">
            <div>
              <span className="text-2xl font-bold text-white">200+</span>
              <p className="mt-1">Homes Sold</p>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <span className="text-2xl font-bold text-white">&lt;60s</span>
              <p className="mt-1">Response Time</p>
            </div>
            <div className="h-8 w-px bg-white/30" />
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
