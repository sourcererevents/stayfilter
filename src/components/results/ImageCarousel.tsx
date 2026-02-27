"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingImage } from "@/types/listing";

interface ImageCarouselProps {
  images: ListingImage[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ images, alt, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxImages = Math.min(images.length, 6); // Cap at 6 images

  function scrollTo(index: number) {
    const bounded = Math.max(0, Math.min(index, maxImages - 1));
    setCurrentIndex(bounded);
    if (scrollRef.current) {
      const child = scrollRef.current.children[bounded] as HTMLElement;
      child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  }

  if (images.length === 0) {
    return (
      <div className={`bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm ${className}`}>
        No image
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      {/* Image strip */}
      <div
        ref={scrollRef}
        className="flex overflow-x-hidden scroll-smooth h-full"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {images.slice(0, maxImages).map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full h-full"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={`${alt} - photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {maxImages > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollTo(currentIndex - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-700" />
            </button>
          )}
          {currentIndex < maxImages - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollTo(currentIndex + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {maxImages > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: maxImages }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                scrollTo(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-white w-2"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
