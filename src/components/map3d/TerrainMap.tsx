"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { LightPhase } from "@/lib/light";
import {
  TERRAIN,
  greyToMetres,
  sceneHeight,
  terrainDepth,
  terrainWidth,
  toScene,
} from "@/lib/terrain";

export type TerrainArea = {
  slug: string;
  name: string;
  tagline: string;
  href: string;
  lat: number;
  lng: number;
};

type Labels = {
  label: string;
  whole: string;
  open: string;
  hint: string;
  loading: string;
};

/** Height grid in metres, decoded from the baked PNG. */
type Grid = { metres: Float32Array; cols: number; rows: number };

async function loadGrid(): Promise<Grid> {
  const img = new Image();
  img.src = TERRAIN.src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  const metres = new Float32Array(img.width * img.height);
  for (let i = 0; i < metres.length; i++) metres[i] = greyToMetres(data[i * 4]);
  return { metres, cols: img.width, rows: img.height };
}

/** Grid steps from each water cell to the nearest land (breadth first). */
function distanceToLand(grid: Grid) {
  const { metres, cols, rows } = grid;
  const dist = new Float32Array(metres.length).fill(Infinity);
  const queue: number[] = [];
  metres.forEach((m, i) => {
    if (m > 0.5) {
      dist[i] = 0;
      queue.push(i);
    }
  });
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    const x = i % cols;
    const y = (i - x) / cols;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const j = ny * cols + nx;
      if (dist[j] > dist[i] + 1) {
        dist[j] = dist[i] + 1;
        queue.push(j);
      }
    }
  }
  return dist;
}

const c = (hex: string) => new THREE.Color(hex);
const PALETTE = {
  lagoon: c("#5cc9c0"),
  reef: c("#2f8f9a"),
  deep: c("#163d5a"),
  sand: c("#e3cfa5"),
  lush: c("#6e9e45"),
  forest: c("#3f7a3a"),
  highland: c("#2f5f33"),
  rock: c("#6b6450"),
};

/** Colour of one point: water by distance from the shore, land by height. */
function colourAt(metres: number, shoreSteps: number, out: THREE.Color) {
  if (metres <= 0.5) {
    // About 100 m per step: the lagoon is inside the reef, roughly 1 km out.
    if (shoreSteps <= 7) return out.copy(PALETTE.lagoon);
    if (shoreSteps <= 12)
      return out.copy(PALETTE.lagoon).lerp(PALETTE.reef, (shoreSteps - 7) / 5);
    return out
      .copy(PALETTE.reef)
      .lerp(PALETTE.deep, Math.min(1, (shoreSteps - 12) / 15));
  }
  if (metres < 4) return out.copy(PALETTE.sand).lerp(PALETTE.lush, metres / 4);
  if (metres < 120)
    return out.copy(PALETTE.lush).lerp(PALETTE.forest, (metres - 4) / 116);
  if (metres < 450)
    return out
      .copy(PALETTE.forest)
      .lerp(PALETTE.highland, (metres - 120) / 330);
  return out
    .copy(PALETTE.highland)
    .lerp(PALETTE.rock, Math.min(1, (metres - 450) / 300));
}

function Terrain({ grid }: { grid: Grid }) {
  const geometry = useMemo(() => {
    const { metres, cols, rows } = grid;
    const g = new THREE.PlaneGeometry(
      terrainWidth,
      terrainDepth,
      cols - 1,
      rows - 1,
    );
    g.rotateX(-Math.PI / 2);
    const shore = distanceToLand(grid);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colours = new Float32Array(pos.count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, sceneHeight(metres[i]));
      colourAt(metres[i], shore[i], tmp).toArray(colours, i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    g.computeVertexNormals();
    return g;
  }, [grid]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0} />
    </mesh>
  );
}

/** Sunlight that follows the living light: low and warm at golden hour. */
const SUN: Record<
  LightPhase,
  { color: string; intensity: number; position: [number, number, number] }
> = {
  morning: { color: "#ffd9b0", intensity: 2.2, position: [220, 90, -40] },
  day: { color: "#fff6e8", intensity: 2.6, position: [-60, 260, 80] },
  golden: { color: "#ffb070", intensity: 2.8, position: [-260, 70, 40] },
  dusk: { color: "#f5a9c4", intensity: 1.6, position: [-260, 35, 60] },
  night: { color: "#9fb3ff", intensity: 0.9, position: [-120, 200, -60] },
};

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const OVERVIEW = {
  position: new THREE.Vector3(-245, 150, 95),
  target: new THREE.Vector3(5, 0, 5),
};

type Flight = {
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPos: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
};

function Camera({
  goal,
  markers,
  points,
}: {
  goal: { position: THREE.Vector3; target: THREE.Vector3 };
  markers: React.RefObject<(HTMLElement | null)[]>;
  points: THREE.Vector3[];
}) {
  const { camera, gl, size } = useThree();
  // Imperative three.js controls live in a ref, created once per canvas.
  const controls = useRef<OrbitControls | null>(null);
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    // No zoom on the wheel: scrolling the page must stay scrolling.
    c.enableZoom = false;
    c.enablePan = false;
    c.enableDamping = true;
    c.rotateSpeed = 0.5;
    c.minPolarAngle = 0.35;
    c.maxPolarAngle = 1.25;
    c.target.copy(OVERVIEW.target);
    controls.current = c;
    return () => c.dispose();
  }, [camera, gl]);

  const flight = useRef<Flight | null>(null);
  useEffect(() => {
    flight.current = {
      fromPos: camera.position.clone(),
      fromTarget: controls.current?.target.clone() ?? OVERVIEW.target.clone(),
      toPos: goal.position,
      toTarget: goal.target,
      start: performance.now(),
    };
  }, [goal, camera]);

  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    const f = flight.current;
    if (f) {
      const t = Math.min(1, (performance.now() - f.start) / 1400);
      const k = easeInOut(t);
      camera.position.lerpVectors(f.fromPos, f.toPos, k);
      c.target.lerpVectors(f.fromTarget, f.toTarget, k);
      if (t === 1) flight.current = null;
    }
    c.enabled = !flight.current;
    c.update();
    // Keep the HTML marker buttons on their places on screen.
    points.forEach((p, i) => {
      const el = markers.current?.[i];
      if (!el) return;
      v.copy(p).project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px) translate(-50%, -100%)`;
      el.style.visibility = visible ? "visible" : "hidden";
    });
  });
  return null;
}

function Pins({
  points,
  selected,
}: {
  points: THREE.Vector3[];
  selected: number;
}) {
  return (
    <>
      {points.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, -3, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 6, 8]} />
            <meshBasicMaterial color="#fdf8f0" />
          </mesh>
          <mesh>
            <sphereGeometry args={[i === selected ? 2.4 : 1.8, 20, 20]} />
            <meshStandardMaterial
              color="#ec5a3c"
              emissive="#ec5a3c"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/**
 * The signature 3D map: the real relief of the west coast, from the baked
 * heightmap, with a pin for each area. Choosing an area (marker or button)
 * flies the camera there and opens a card linking to its guide. Drag to
 * turn the coast; the mouse wheel keeps scrolling the page. Loaded only on
 * capable devices by TerrainMapSlot.
 */
export default function TerrainMap({
  areas,
  labels,
}: {
  areas: TerrainArea[];
  labels: Labels;
}) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [selected, setSelected] = useState(-1);
  const [onScreen, setOnScreen] = useState(true);
  const [phase, setPhase] = useState<LightPhase>("day");
  const box = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    loadGrid().then((g) => alive && setGrid(g));
    return () => {
      alive = false;
    };
  }, []);

  // Follow the living light, and stop rendering while off screen.
  useEffect(() => {
    const read = () =>
      setPhase((document.documentElement.dataset.light as LightPhase) || "day");
    read();
    const watch = new MutationObserver(read);
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-light"],
    });
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    if (box.current) io.observe(box.current);
    return () => {
      watch.disconnect();
      io.disconnect();
    };
  }, []);

  const points = useMemo(() => {
    if (!grid) return [];
    return areas.map((a) => {
      const { x, z } = toScene(a.lat, a.lng);
      const col = Math.round(
        ((x + terrainWidth / 2) / terrainWidth) * (grid.cols - 1),
      );
      const row = Math.round(
        ((z + terrainDepth / 2) / terrainDepth) * (grid.rows - 1),
      );
      const ground = sceneHeight(grid.metres[row * grid.cols + col] ?? 0);
      return new THREE.Vector3(x, ground + 6, z);
    });
  }, [areas, grid]);

  const goal = useMemo(() => {
    if (selected < 0 || !points[selected]) return OVERVIEW;
    const p = points[selected];
    return {
      target: new THREE.Vector3(p.x, p.y - 4, p.z),
      // From the sea, a little to the south west, looking inland.
      position: new THREE.Vector3(p.x - 95, p.y + 72, p.z + 50),
    };
  }, [selected, points]);

  const sun = SUN[phase];
  const area = areas[selected];

  return (
    <div
      ref={box}
      className="relative h-full w-full overflow-hidden rounded-sm bg-linear-to-b from-wash-from via-wash-via to-sand-50"
    >
      {grid ? (
        <Canvas
          role="img"
          aria-label={labels.label}
          frameloop={onScreen ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{
            fov: 32,
            near: 1,
            far: 2000,
            position: OVERVIEW.position.toArray(),
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          // The square edges of the terrain fade into the page.
          className="[mask-image:radial-gradient(ellipse_72%_75%_at_50%_50%,black_62%,transparent_100%)]"
        >
          <hemisphereLight args={["#fdf8f0", "#1c3f5d", 1.1]} />
          <directionalLight
            color={sun.color}
            intensity={sun.intensity}
            position={sun.position}
          />
          <Terrain grid={grid} />
          <Pins points={points} selected={selected} />
          <Camera goal={goal} markers={markers} points={points} />
        </Canvas>
      ) : (
        <p className="absolute inset-0 flex items-center justify-center text-small text-ink-muted">
          {labels.loading}
        </p>
      )}

      {/* The markers as real buttons over the canvas: keyboard and screen
          reader friendly. Positioned every frame by the camera above. */}
      {grid &&
        areas.map((a, i) => (
          <button
            key={a.slug}
            ref={(el) => {
              markers.current[i] = el;
            }}
            type="button"
            onClick={() => setSelected(i)}
            aria-pressed={i === selected}
            className={`absolute top-0 left-0 -mt-4 rounded-full px-3 py-1.5 text-small font-medium whitespace-nowrap shadow-md transition-colors ${
              i === selected
                ? "bg-ocean-900 text-white"
                : "bg-surface/95 text-ink hover:bg-white"
            }`}
            style={{ visibility: "hidden" }}
          >
            {a.name}
          </button>
        ))}

      <p className="pointer-events-none absolute top-4 left-4 max-w-xs rounded-sm bg-surface/90 px-3 py-2 text-small text-ink-muted">
        {labels.hint}
      </p>

      {area && (
        <div className="absolute bottom-4 left-4 w-80 max-w-[calc(100%-2rem)] rounded-sm bg-surface p-5 shadow-lg">
          <p className="type-h4">{area.name}</p>
          <p className="mt-1 text-small text-ink-muted">{area.tagline}</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <a
              href={area.href}
              className="text-small font-medium text-lagoon-700 hover:underline"
            >
              {labels.open.replace("{name}", area.name)} →
            </a>
            <button
              type="button"
              onClick={() => setSelected(-1)}
              className="text-small text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              {labels.whole}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
