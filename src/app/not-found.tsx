import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Logo variant="dark" size="lg" />
      <h1 className="mt-8 text-6xl font-bold text-navy-800">404</h1>
      <p className="mt-4 text-lg text-gray-600 text-center max-w-md">
        This property listing could not be found. It may have been sold or taken off the market.
      </p>
      <div className="mt-8 flex gap-4">
        <a href="/">
          <Button variant="compass">Back to Home</Button>
        </a>
        <a href="/#properties">
          <Button variant="secondary">Browse Properties</Button>
        </a>
      </div>
    </div>
  );
}
