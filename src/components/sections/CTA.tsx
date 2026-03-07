import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CTAProps {
  onOpenChat?: () => void;
}

export function CTA({ onOpenChat }: CTAProps) {
  return (
    <section id="contact" className="py-20 md:py-28 bg-warm-100">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-balance">
            Ready to Find Your{' '}
            <span className="text-compass-500">Perfect Home?</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Start a conversation with our AI assistant and get personalized property recommendations in seconds. Available 24/7, no appointment needed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="compass" size="lg" onClick={onOpenChat}>
              Start Chatting Now
            </Button>
            <a href="/booking">
              <Button
                variant="secondary"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-white"
              >
                Schedule a Call
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No signup required. Get instant answers to your questions.
          </p>
        </div>
      </Container>
    </section>
  );
}
