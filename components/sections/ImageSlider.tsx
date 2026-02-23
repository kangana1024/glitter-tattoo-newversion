"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Slide {
  src: string;
  alt: string;
  title?: string;
  href?: string;
}

interface ImageSliderProps {
  slides: Slide[];
  autoPlayInterval?: number;
  className?: string;
}

export default function ImageSlider({
  slides,
  autoPlayInterval = 4000,
  className = "",
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [goNext, autoPlayInterval, isHovered, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? goNext() : goPrev();
        }
      }}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {slide.href ? (
              <a
                href={slide.href}
                className="block w-full h-full relative group"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </a>
            ) : (
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {slide.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white font-heading text-lg sm:text-xl font-semibold">
                  {slide.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Previous/Next */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
