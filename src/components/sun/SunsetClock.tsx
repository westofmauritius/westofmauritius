"use client";

import { useEffect, useState } from "react";
import { nextSunset } from "@/lib/sun";
import { cn } from "@/lib/cn";

const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Indian/Mauritius",
});

/**
 * "Sunset tonight in Tamarin: 18:08 · golden light from 17:41". Worked out
 * in the browser (the page is prerendered and cannot know today's date);
 * until then the line keeps its space, so nothing on the page moves.
 */
export function SunsetClock({
  lat,
  lng,
  tonight,
  tomorrow,
  golden,
  className,
}: {
  lat: number;
  lng: number;
  /** Texts with "{time}" where the time goes. */
  tonight: string;
  tomorrow: string;
  golden: string;
  className?: string;
}) {
  const [next, setNext] = useState<ReturnType<typeof nextSunset>>(null);

  useEffect(() => {
    const update = () => setNext(nextSunset(lat, lng));
    update();
    // Roll over to tomorrow's sunset once tonight's has passed.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [lat, lng]);

  const fill = (text: string, date: Date) =>
    text.replace("{time}", time.format(date));

  return (
    <p className={cn("min-h-[3em] tabular-nums sm:min-h-[1.5em]", className)}>
      {next && (
        <>
          <span aria-hidden="true" className="mr-2">
            ☀
          </span>
          {fill(next.tomorrow ? tomorrow : tonight, next.sunset)}
          {next.golden && (
            <span>
              {" · "}
              {fill(golden, next.golden)}
            </span>
          )}
        </>
      )}
    </p>
  );
}
