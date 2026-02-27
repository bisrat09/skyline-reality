import { cn } from '@/lib/utils/cn';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-12', align === 'center' ? 'text-center' : 'text-left')}>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-800">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
