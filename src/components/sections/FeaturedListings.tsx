import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { PropertyGrid } from '@/components/listings/PropertyGrid';
import { seedListings } from '@/data/seedListings';

// Use seed data with generated IDs for the static landing page
const featuredListings = seedListings
  .filter((l) => l.isFeatured)
  .slice(0, 6)
  .map((listing, index) => ({
    ...listing,
    id: `featured-${index + 1}`,
  }));

export function FeaturedListings() {
  return (
    <section id="properties" className="py-20 md:py-28 bg-white">
      <Container>
        <SectionHeading
          title="Featured Properties"
          subtitle="Explore our hand-picked selection of premium Seattle homes, from urban condos to family estates."
        />
        <PropertyGrid listings={featuredListings} columns={3} />
        <div className="mt-12 text-center">
          <Button variant="compass" size="lg">
            View All Listings
          </Button>
        </div>
      </Container>
    </section>
  );
}
