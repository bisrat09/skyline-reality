import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from '@/components/ui/Logo';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Logo variant="dark" size="md" />
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-700">Lead Dashboard</h1>
            </div>
          </div>
        </Container>
      </header>
      <main className="py-8">
        <Container>
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        </Container>
      </main>
    </div>
  );
}
