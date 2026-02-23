import { getResponsiveImage } from '@/lib/legacy-content';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 1280px';

export default function ResponsiveImage({
  src,
  alt,
  className,
  sizes = DEFAULT_SIZES,
  loading = 'lazy',
  width,
  height,
}: ResponsiveImageProps) {
  const imageData = getResponsiveImage(src);

  if (!imageData) {
    // Fallback: render plain img with original src
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
      />
    );
  }

  const fallbackSrc = imageData.fallbackSrc;

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={imageData.srcset}
        sizes={sizes}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
        decoding="async"
      />
    </picture>
  );
}
