import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ImageSlider from "./ImageSlider";

interface Slide {
  src: string;
  alt: string;
  title?: string;
  href?: string;
}

interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaHref: string;
  slides?: Slide[];
}

export default function Hero({
  heading,
  subheading,
  ctaText,
  ctaHref,
  slides,
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background: Slider or gradient */}
      {slides && slides.length > 0 ? (
        <>
          <ImageSlider
            slides={slides}
            autoPlayInterval={5000}
            className="aspect-16/7 sm:aspect-16/6 lg:aspect-16/5"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10 pointer-events-none" />
        </>
      ) : (
        <div className="aspect-16/7 sm:aspect-16/6 lg:aspect-16/5 bg-linear-to-br from-primary via-accent-blue to-secondary" />
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center bg-black/40 backdrop-blur-lg rounded-3xl p-8 sm:p-14 border border-white/20 shadow-2xl pointer-events-auto animate-fade-in-up">
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              {heading}
            </h1>
            <p className="font-body text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-lg font-light">
              {subheading}
            </p>
            <Button
              href={ctaHref}
              variant="primary"
              size="lg"
              className="shadow-[0_0_30px_rgba(255,107,157,0.4)] text-lg px-10 py-4"
            >
              {ctaText}
            </Button>
          </div>
        </Container>
      </div>
    </section>
  );
}
