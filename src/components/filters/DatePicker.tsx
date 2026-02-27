"use client";

import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFilterStore } from "@/stores/filterStore";

export function DatePicker() {
  const dates = useFilterStore((s) => s.dates);
  const setDates = useFilterStore((s) => s.setDates);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="date"
          placeholder="Check in"
          value={dates.checkin || ""}
          onChange={(e) => setDates({ ...dates, checkin: e.target.value || null })}
          className="pl-10 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
        />
      </div>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="date"
          placeholder="Check out"
          value={dates.checkout || ""}
          onChange={(e) => setDates({ ...dates, checkout: e.target.value || null })}
          className="pl-10 h-11 bg-zinc-50 border-zinc-200 rounded-xl text-sm focus:bg-white transition-colors"
        />
      </div>
    </div>
  );
}
