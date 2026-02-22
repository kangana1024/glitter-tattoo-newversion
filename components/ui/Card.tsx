import Image from 'next/image';
import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  className?: string;
}

export default function Card({
  title,
  description,
  image,
  imageAlt = '',
  href,
  className = '',
}: CardProps) {
  const content = (
    <>
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </>
  );

  const cardClasses = `group bg-surface rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <article className={cardClasses}>{content}</article>;
}
