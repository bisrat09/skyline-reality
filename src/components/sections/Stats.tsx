import { Container } from '@/components/ui/Container';

const stats = [
  { value: '200+', label: 'Properties Sold' },
  { value: '$150M+', label: 'In Sales Volume' },
  { value: '<60s', label: 'Avg Response Time' },
  { value: '98%', label: 'Client Satisfaction' },
];

export function Stats() {
  return (
    <section id="about" className="py-16 md:py-20 bg-navy-800">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gold-400">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
