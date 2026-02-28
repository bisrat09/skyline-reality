import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function CTA() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-navy-900 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-400/10 via-transparent to-transparent" />

      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
            Ready to Find Your{' '}
            <span className="text-gold-400">Perfect Home?</span>
          </h2>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed">
            Start a conversation with our AI assistant and get personalized property recommendations in seconds. Available 24/7, no appointment needed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="lg">
              Start Chatting Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Schedule a Call
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No signup required. Get instant answers to your questions.
          </p>
        </div>
      </Container>
    </section>
  );
}
