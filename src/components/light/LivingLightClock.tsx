"use client";

import { useEffect } from "react";
import { LIGHT_PLACE, lightPhase } from "@/lib/light";

/**
 * Keeps the living light current while a page stays open: the head script
 * sets it once before the first paint, this checks again every few
 * minutes. Renders nothing.
 */
export function LivingLightClock() {
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.light = lightPhase(
        LIGHT_PLACE.lat,
        LIGHT_PLACE.lng,
        Date.now(),
      );
    };
    update();
    const timer = window.setInterval(update, 5 * 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
