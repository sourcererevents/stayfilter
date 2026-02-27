"use client";

import { Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "./ImageCarousel";
import type { Listing } from "@/types/listing";

interface ResultCardProps {
  listing: Listing;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ResultCard({
  listing,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}: ResultCardProps) {
  const { name, city, roomType, images, price, rating, reviewCount, badges, listingUrl, source, crossListedOn, crossListedPrice, crossListedUrl } = listing;

  const isGuestFavorite = badges.includes("GUEST_FAVORITE") || badges.includes("TOP_X_GUEST_FAVORITE");
  const isSuperhost = badges.includes("SUPERHOST");

  return (
    <a
      href={listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex rounded-xl border bg-white overflow-hidden transition-all group cursor-pointer
        ${isHovered ? "border-zinc-400 shadow-md" : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image carousel */}
      <ImageCarousel
        images={images}
        alt={name}
        className="w-[200px] min-w-[200px] h-[150px] rounded-l-xl"
      />

      {/* Details */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          {/* Top row: source + city + badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Source badge */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              source === "airbnb"
                ? "bg-rose-50 text-rose-600"
                : "bg-blue-50 text-blue-600"
            }`}>
              {source === "airbnb" ? "Airbnb" : "VRBO"}
            </span>
            <span className="text-xs text-zinc-500 truncate">{city}</span>
            {isGuestFavorite && (
              <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] px-1.5 py-0 h-4 font-semibold">
                Guest favorite
              </Badge>
            )}
            {isSuperhost && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 h-4 font-semibold">
                Superhost
              </Badge>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold text-zinc-900 truncate leading-snug">
            {name}
          </h3>

          {/* Room info */}
          {roomType && (
            <p className="text-xs text-zinc-400 truncate">{roomType}</p>
          )}
        </div>

        {/* Bottom row: rating + price */}
        <div className="flex items-end justify-between mt-2">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {rating !== null ? (
              <>
                <Star className="w-3.5 h-3.5 fill-zinc-900 text-zinc-900" />
                <span className="text-sm font-semibold text-zinc-900">{rating}</span>
                {reviewCount > 0 && (
                  <span className="text-xs text-zinc-400">({reviewCount})</span>
                )}
              </>
            ) : (
              <span className="text-xs text-zinc-400">New</span>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            {price.originalAmount && price.originalAmount > price.amount ? (
              <>
                <span className="text-xs text-zinc-400 line-through mr-1">
                  ${price.originalAmount.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-zinc-900">
                  ${price.amount.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-zinc-900">
                ${price.amount.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-zinc-500 ml-1">{price.qualifier}</span>
            {/* Cross-listing info */}
            {crossListedOn && crossListedPrice && (
              <div className="mt-0.5">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (crossListedUrl) window.open(crossListedUrl, "_blank");
                  }}
                  className="text-[10px] text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  Also ${crossListedPrice.amount.toLocaleString()} on {crossListedOn === "airbnb" ? "Airbnb" : "VRBO"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* External link indicator */}
      <div className="flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
      </div>
    </a>
  );
}
