"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
function priceDivIcon(
  label: string,
  isHovered: boolean,
  isSelected: boolean
): L.DivIcon {
  const stateClass = isSelected
    ? "price-pin--selected"
    : isHovered
      ? "price-pin--hovered"
      : "";

  return L.divIcon({
    className: "", // clear default leaflet-div-icon class
    html: `<div class="price-pin ${stateClass}">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Create a custom cluster icon showing the listing count */
function createClusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  let sizeClass = "cluster-pin--sm";
  if (count >= 20) sizeClass = "cluster-pin--lg";
  else if (count >= 5) sizeClass = "cluster-pin--md";

  return L.divIcon({
    className: "",
    html: `<div class="cluster-pin ${sizeClass}"><span>${count}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

/** Tooltip content as a React component */
function TooltipContent({ listing }: { listing: Listing }) {
  const img = listing.images[0]?.url;
  return (
    <div className="map-tooltip">
      {img && (
        <div className="map-tt-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" />
        </div>
      )}
      <div className="map-tt-body">
        <div className="map-tt-name">{listing.name}</div>
        <div className="map-tt-meta">
          {listing.rating !== null ? (
            <span className="map-tt-rating">★ {listing.rating}</span>
          ) : (
            <span className="map-tt-new">New</span>
          )}
          {listing.reviewCount > 0 && (
            <span className="map-tt-reviews">({listing.reviewCount})</span>
          )}
          <span className="map-tt-price">
            {formatPrice(listing)}{" "}
            <span className="map-tt-qual">{listing.price.qualifier}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Bounds fitter sub-component ──

function BoundsFitter({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) {
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
  const markerRef = useRef<L.Marker>(null);

  const isHovered = hoveredId === listing.id;
  const isSelected = selectedId === listing.id;
  const priceLabel = formatPrice(listing);

  const icon = useMemo(
    () => priceDivIcon(priceLabel, isHovered, isSelected),
    [priceLabel, isHovered, isSelected]
  );

  // Open tooltip programmatically when card is hovered in the list
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (isHovered) {
      marker.openTooltip();
    } else {
      marker.closeTooltip();
    }
  }, [isHovered]);

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
      ref={markerRef}
      position={[listing.lat, listing.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
      zIndexOffset={isHovered || isSelected ? 1000 : 0}
    >
      <Tooltip
        direction="top"
        offset={[0, -8]}
        opacity={1}
        className="map-tooltip-container"
      >
        <TooltipContent listing={listing} />
      </Tooltip>
    </Marker>
  );
}

// ── Main map component ──

export default function ResultMap() {
  const listings = useSearchStore((s) => s.listings);

  const mappable = useMemo(() => withCoords(listings), [listings]);

  const defaultCenter: L.LatLngTuple = [39.8, -98.5];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={4}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      {/* CartoDB Voyager — modern, clean tile style */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <BoundsFitter listings={mappable} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        animate={true}
        animateAddingMarkers={false}
        disableClusteringAtZoom={16}
      >
        {mappable.map((listing) => (
          <PricePin key={`${listing.source}-${listing.id}`} listing={listing} />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
