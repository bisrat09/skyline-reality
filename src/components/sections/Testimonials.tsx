import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';

const testimonials = [
  {
    quote: 'The AI chatbot answered all my questions at 11pm on a Sunday. By Monday morning I had a showing booked. Incredible experience.',
    name: 'Sarah M.',
    role: 'First-time Homebuyer',
    neighborhood: 'Capitol Hill',
  },
  {
    quote: 'I was skeptical about AI in real estate, but the instant responses and personalized property suggestions won me over. Found our dream home in Ballard.',
    name: 'James & Lin T.',
    role: 'Growing Family',
    neighborhood: 'Ballard',
  },
  {
    quote: 'As an investor, speed matters. Skyline\'s AI qualified me and sent matching listings before I even finished my coffee. Closed on two properties.',
    name: 'Michael R.',
    role: 'Real Estate Investor',
    neighborhood: 'Beacon Hill',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white">
      <Container>
        <SectionHeading
          title="What Our Clients Say"
          subtitle="Real stories from real Seattle homebuyers who found their perfect property."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 md:p-8">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">
                  {testimonial.role} &middot; {testimonial.neighborhood}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
