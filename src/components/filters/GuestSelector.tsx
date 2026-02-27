"use client";

import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFilterStore } from "@/stores/filterStore";

interface CounterRowProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function CounterRow({ label, sublabel, value, onChange, min = 0, max = 16 }: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="text-xs text-zinc-500">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function GuestSelector() {
  const guests = useFilterStore((s) => s.guests);
  const setGuests = useFilterStore((s) => s.setGuests);

  const totalGuests = guests.adults + guests.children;
  const label =
    totalGuests === 1
      ? "1 guest"
      : `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`;
  const extras: string[] = [];
  if (guests.infants > 0) extras.push(`${guests.infants} infant${guests.infants > 1 ? "s" : ""}`);
  if (guests.pets > 0) extras.push(`${guests.pets} pet${guests.pets > 1 ? "s" : ""}`);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm justify-start gap-2 font-normal hover:bg-white transition-colors"
        >
          <Users className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900">{label}</span>
          {extras.length > 0 && (
            <span className="text-zinc-400">, {extras.join(", ")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-1 divide-y divide-zinc-100">
          <CounterRow
            label="Adults"
            sublabel="Ages 13+"
            value={guests.adults}
            onChange={(v) => setGuests({ adults: v })}
            min={1}
          />
          <CounterRow
            label="Children"
            sublabel="Ages 2–12"
            value={guests.children}
            onChange={(v) => setGuests({ children: v })}
          />
          <CounterRow
            label="Infants"
            sublabel="Under 2"
            value={guests.infants}
            onChange={(v) => setGuests({ infants: v })}
            max={5}
          />
          <CounterRow
            label="Pets"
            sublabel="Service animals welcome"
            value={guests.pets}
            onChange={(v) => setGuests({ pets: v })}
            max={5}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
