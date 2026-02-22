'use client';

import { useState } from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';

interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
}

interface GalleryCategory {
  id: string;
  title: string;
}

interface GalleryGridProps {
  heading: string;
  intro: string;
  categories: GalleryCategory[];
  items: GalleryItem[];
  allLabel?: string;
}

export default function GalleryGrid({
  heading,
  intro,
  categories,
  items,
  allLabel = 'All',
}: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-surface">
      <Container>
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-4">
          {heading}
        </h1>
        <p className="font-body text-base sm:text-lg text-text-secondary text-center mb-10 max-w-2xl mx-auto">
          {intro}
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-colors duration-200 ${
              activeCategory === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {allLabel}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-colors duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <span className="font-body text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
                  {item.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
