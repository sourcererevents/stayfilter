"use client";

import { useEffect, useState } from "react";
import { Heart, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchStore } from "@/stores/searchStore";

export const DONATE_URL = "https://buymeacoffee.com/stayfilter";

const STORAGE_KEY = "stayfilter_donate_seen";
const COOLDOWN_DAYS = 7;

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return true;
  const lastSeen = parseInt(stored, 10);
  if (isNaN(lastSeen)) return true;
  const daysSince = (Date.now() - lastSeen) / (1000 * 60 * 60 * 24);
  return daysSince >= COOLDOWN_DAYS;
}

function markSeen() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

export function DonatePopup() {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const status = useSearchStore((s) => s.status);
  const hasSearched = useSearchStore((s) => s.hasSearched);

  // Trigger popup after first successful search
  useEffect(() => {
    if (triggered) return;
    if (hasSearched && status === "success") {
      // Small delay so results render first
      const timer = setTimeout(() => {
        if (shouldShow()) {
          setOpen(true);
        }
        setTriggered(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, hasSearched, triggered]);

  function handleDismiss() {
    markSeen();
    setOpen(false);
  }

  function handleDonate() {
    markSeen();
    window.open(DONATE_URL, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-600" />

        <div className="px-6 pt-5 pb-6 space-y-4">
          {/* Icon + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900">
              Keep StayFilter alive
            </DialogTitle>
          </div>

          {/* Body copy */}
          <p className="text-sm text-zinc-500 leading-relaxed">
            StayFilter is free and always will be. If it helped you find the
            right place to stay, a small donation helps cover hosting and keeps
            new features coming.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleDonate}
              className="flex-1 h-11 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/20"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Buy us a coffee
            </Button>
            <button
              onClick={handleDismiss}
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors whitespace-nowrap"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Custom close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
