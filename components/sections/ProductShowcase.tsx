import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

interface ProductCategory {
  id: string;
  title: string;
  description: string;
  images: string[];
  href: string;
}

interface ProductShowcaseProps {
  heading: string;
  categories: ProductCategory[];
}

export default function ProductShowcase({
  heading,
  categories,
}: ProductShowcaseProps) {
  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-12">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group bg-surface/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Image grid: 1 large + 2 small */}
              <div className="grid grid-cols-2 gap-1 p-1">
                <div className="col-span-2 relative aspect-[16/9] overflow-hidden rounded-t-xl">
                  <Image
                    src={cat.images[0]}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                {cat.images.slice(1, 3).map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg"
                  >
                    <Image
                      src={img}
                      alt={`${cat.title} ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 17vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {cat.title}
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
