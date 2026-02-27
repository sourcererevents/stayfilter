"use client";

import { useEffect, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useSearchStore } from "@/stores/searchStore";
import type { Listing } from "@/types/listing";

// ── Helpers ──

/** Filter out listings with missing coordinates */
function withCoords(listings: Listing[]): Listing[] {
  return listings.filter((l) => l.lat !== 0 || l.lng !== 0);
}

/** Format price for pin label */
function formatPrice(listing: Listing): string {
  const amt = listing.price.amount;
  if (amt >= 1000) return `$${(amt / 1000).toFixed(1)}k`;
  return `$${amt}`;
}

/** Create a Leaflet divIcon for a price pin */
function priceDivIcon(label: string, isHovered: boolean, isSelected: boolean): L.DivIcon {
  const stateClass = isSelected
    ? "price-pin--selected"
    : isHovered
      ? "price-pin--hovered"
      : "";

  return L.divIcon({
    className: "", // clear default leaflet-div-icon class
    html: `<div class="price-pin ${stateClass}">${label}</div>`,
    iconSize: [0, 0], // let CSS handle sizing
    iconAnchor: [0, 0], // anchor at the arrow tip
  });
}

// ── Bounds fitter sub-component ──
// Uses react-leaflet's useMap() hook to access the map instance

function BoundsFitter({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) {
      // Default view: North America
      map.setView([39.8, -98.5], 4);
      return;
    }

    if (listings.length === 1) {
      map.setView([listings[0].lat, listings[0].lng], 13);
      return;
    }

    const bounds = L.latLngBounds(
      listings.map((l) => [l.lat, l.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [listings, map]);

  return null;
}

// ── Individual pin component ──

function PricePin({ listing }: { listing: Listing }) {
  const hoveredId = useSearchStore((s) => s.hoveredListingId);
  const selectedId = useSearchStore((s) => s.selectedListingId);
  const setHovered = useSearchStore((s) => s.setHoveredListing);
  const setSelected = useSearchStore((s) => s.setSelectedListing);

  const isHovered = hoveredId === listing.id;
  const isSelected = selectedId === listing.id;
  const priceLabel = formatPrice(listing);

  const icon = useMemo(
    () => priceDivIcon(priceLabel, isHovered, isSelected),
    [priceLabel, isHovered, isSelected]
  );

  const eventHandlers = useMemo(
    () => ({
      mouseover: () => setHovered(listing.id),
      mouseout: () => setHovered(null),
      click: () => {
        setSelected(listing.id);
        window.open(listing.listingUrl, "_blank", "noopener,noreferrer");
      },
    }),
    [listing.id, listing.listingUrl, setHovered, setSelected]
  );

  return (
    <Marker
      position={[listing.lat, listing.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
      // Force z-index so hovered pins appear on top
      zIndexOffset={isHovered || isSelected ? 1000 : 0}
    />
  );
}

// ── Main map component ──

export default function ResultMap() {
  const listings = useSearchStore((s) => s.listings);

  const mappable = useMemo(() => withCoords(listings), [listings]);

  // Default center (North America) — gets overridden by BoundsFitter
  const defaultCenter: L.LatLngTuple = [39.8, -98.5];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={4}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsFitter listings={mappable} />

      {mappable.map((listing) => (
        <PricePin key={`${listing.source}-${listing.id}`} listing={listing} />
      ))}
    </MapContainer>
  );
}
