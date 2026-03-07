import { cn } from '@/lib/utils/cn';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-2xl',
};

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  return (
    <span
      className={cn(
        'font-serif font-bold tracking-tight',
        sizeStyles[size],
        variant === 'light' ? 'text-white' : 'text-navy-800'
      )}
    >
      Skyline<span className="text-gold-400"> Realty</span>
    </span>
  );
}
