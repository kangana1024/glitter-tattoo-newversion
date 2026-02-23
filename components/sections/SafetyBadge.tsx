import Image from "next/image";
import Container from "@/components/ui/Container";

interface SafetyItem {
  title: string;
  description: string;
  icon: "shield" | "certificate" | "heart";
}

interface SafetyBadgeProps {
  heading: string;
  items: SafetyItem[];
  images?: string[];
}

const icons: Record<string, React.ReactNode> = {
  shield: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  ),
  certificate: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  ),
  heart: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
};

export default function SafetyBadge({
  heading,
  items,
  images,
}: SafetyBadgeProps) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-accent-green/10 via-surface to-primary/5">
      <Container>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-12">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {items.map((item, i) => (
            <div
              key={i}
              className="text-center bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/50 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-green/10 text-accent-green mb-4">
                {icons[item.icon] || icons.shield}
              </div>
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        {images && images.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {images.map((src, i) => (
              <div key={i} className="relative w-40 h-40 sm:w-48 sm:h-48">
                <Image
                  src={src}
                  alt={`Safety certificate ${i + 1}`}
                  fill
                  sizes="192px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
