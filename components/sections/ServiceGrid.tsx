import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface ServiceGridProps {
  heading: string;
  services: ServiceItem[];
  locale: string;
}

export default function ServiceGrid({ heading, services, locale }: ServiceGridProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface">
      <Container>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-12">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              title={service.title}
              description={service.description}
              image={service.image}
              imageAlt={service.title}
              href={`/${locale}/services`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
