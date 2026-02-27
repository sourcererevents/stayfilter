"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilterStore } from "@/stores/filterStore";

export function LocationSearch() {
  const location = useFilterStore((s) => s.location);
  const setLocation = useFilterStore((s) => s.setLocation);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <Input
        placeholder="Where are you going?"
        value={location.query}
        onChange={(e) => setLocation({ query: e.target.value })}
        className="pl-10 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
      />
    </div>
  );
}
