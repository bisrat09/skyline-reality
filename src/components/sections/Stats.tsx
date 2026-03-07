import { Container } from '@/components/ui/Container';

const stats = [
  { value: '200+', label: 'Properties Sold' },
  { value: '$150M+', label: 'In Sales Volume' },
  { value: '<60s', label: 'Avg Response Time' },
  { value: '98%', label: 'Client Satisfaction' },
];

export function Stats() {
  return (
    <section id="about" className="py-16 md:py-20 bg-warm-100">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center relative">
              <p className="text-3xl md:text-4xl font-bold text-compass-500">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
