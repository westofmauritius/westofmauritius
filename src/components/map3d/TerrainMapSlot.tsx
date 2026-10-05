"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { TerrainArea } from "./TerrainMap";

// Three.js and the scene are a separate download, fetched only when needed.
const TerrainMap = dynamic(() => import("./TerrainMap"), { ssr: false });

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Whether this device should get the 3D map: a desktop size screen with a
 * mouse, no request for less motion or data, enough cores and memory, and
 * a hardware graphics card (software rendering would be slow). `?map3d=1`
 * forces it on, for testing.
 */
function capable() {
  if (new URLSearchParams(location.search).get("map3d") === "1") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (!window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches)
    return false;
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    deviceMemory?: number;
  };
  if (
    nav.connection?.saveData ||
    /(^|-)(2g|3g)$/.test(nav.connection?.effectiveType ?? "")
  ) {
    return false;
  }
  if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4)
    return false;
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return false;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !/swiftshader|llvmpipe|software/i.test(renderer);
}

/**
 * The map section's slot: the 2D map (passed as children) for everyone by
 * default, swapped for the 3D terrain map on capable devices. The 3D code is
 * only downloaded once the section comes near the screen, so it never
 * competes with the page itself. Phones, small or low end devices, data
 * saver and reduced motion keep the 2D map.
 */
export function TerrainMapSlot({
  areas,
  labels,
  children,
  className,
}: {
  areas: TerrainArea[];
  labels: React.ComponentProps<typeof TerrainMap>["labels"];
  children: React.ReactNode;
  className?: string;
}) {
  const [use3d, setUse3d] = useState(false);
  const [near, setNear] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Decided on the client only: the server always sends the 2D map.
  useEffect(() => {
    if (!capable()) return;
    const id = window.requestAnimationFrame(() => setUse3d(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Then fetch the 3D code once the section comes near the screen.
  useEffect(() => {
    if (!use3d || !box.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [use3d]);

  if (!use3d) return <>{children}</>;
  return (
    <div ref={box} className={className}>
      {near ? (
        <TerrainMap areas={areas} labels={labels} />
      ) : (
        <div className="h-full w-full rounded-sm bg-linear-to-b from-wash-from via-wash-via to-sand-50" />
      )}
    </div>
  );
}
