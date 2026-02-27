"use client";

import { BedDouble, Bath, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/stores/filterStore";

const counts = [0, 1, 2, 3, 4, 5, 6, 7, 8];

interface CountSelectorProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function CountSelector({ icon, label, value, onChange }: CountSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        {icon}
        {label}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {counts.map((n) => (
          <Button
            key={n}
            variant={value === n ? "default" : "outline"}
            size="sm"
            className={`h-8 w-10 rounded-lg text-xs ${
              value === n
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
            }`}
            onClick={() => onChange(n)}
          >
            {n === 0 ? "Any" : `${n}+`}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function RoomCounts() {
  const minBedrooms = useFilterStore((s) => s.minBedrooms);
  const minBeds = useFilterStore((s) => s.minBeds);
  const minBathrooms = useFilterStore((s) => s.minBathrooms);
  const setMinBedrooms = useFilterStore((s) => s.setMinBedrooms);
  const setMinBeds = useFilterStore((s) => s.setMinBeds);
  const setMinBathrooms = useFilterStore((s) => s.setMinBathrooms);

  return (
    <div className="space-y-5">
      <CountSelector
        icon={<DoorOpen className="w-4 h-4" />}
        label="Bedrooms"
        value={minBedrooms}
        onChange={setMinBedrooms}
      />
      <CountSelector
        icon={<BedDouble className="w-4 h-4" />}
        label="Beds"
        value={minBeds}
        onChange={setMinBeds}
      />
      <CountSelector
        icon={<Bath className="w-4 h-4" />}
        label="Bathrooms"
        value={minBathrooms}
        onChange={setMinBathrooms}
      />
    </div>
  );
}
