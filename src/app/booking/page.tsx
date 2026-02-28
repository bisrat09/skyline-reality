import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CalEmbed } from '@/components/booking/CalEmbed';

export const metadata = {
  title: 'Book a Showing | Skyline Realty',
  description: 'Schedule a property showing with Skyline Realty. Pick a time that works for you.',
};

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-gray-50">
        <Container>
          <SectionHeading
            title="Book a Showing"
            subtitle="Select a convenient time and one of our agents will meet you at the property."
          />
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="h-[600px]">
              <CalEmbed />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
