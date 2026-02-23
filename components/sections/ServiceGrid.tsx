import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

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

export default function ServiceGrid({
  heading,
  services,
  locale,
}: ServiceGridProps) {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32 bg-surface overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-20 -mb-20 animate-float"></div>

      <Container className="relative z-10">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 bg-linear-to-r from-primary via-[#ff4785] to-accent-orange bg-clip-text text-transparent drop-shadow-sm">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
