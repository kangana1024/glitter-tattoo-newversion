import Image from 'next/image';
import Container from '@/components/ui/Container';

interface PressMediaProps {
  heading: string;
  images: Array<{ src: string; alt: string }>;
}

export default function PressMedia({ heading, images }: PressMediaProps) {
  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-12">
          {heading}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 sm:w-auto snap-center relative aspect-[3/4] overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 192px, (max-width: 1024px) 33vw, 16vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
