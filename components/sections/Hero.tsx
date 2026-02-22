import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaHref: string;
}

export default function Hero({ heading, subheading, ctaText, ctaHref }: HeroProps) {
  return (
    <section className="relative w-full bg-gradient-to-br from-primary via-accent-blue to-secondary py-24 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-black/20" />
      <Container className="relative z-10 text-center">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
          {heading}
        </h1>
        <p className="font-body text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          {subheading}
        </p>
        <Button href={ctaHref} variant="secondary" size="lg">
          {ctaText}
        </Button>
      </Container>
    </section>
  );
}
