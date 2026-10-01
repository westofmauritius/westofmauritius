/**
 * Illustrated west-coast sunset used as the start page's hero until a real
 * photo is chosen in the editor (Keystatic → Start page). A stylised scene,
 * not a depiction of a specific place: sun over the ocean, a mountain
 * silhouette, the reef line and the lagoon. Pure SVG: a few kilobytes, sharp
 * on every screen, no image download.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      {/* Wide screens: the whole scene, mountain on the left. */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="hidden h-full w-full sm:block"
      >
        <Scene id="hero-wide" reflection />
      </svg>
      {/* Phones: a tall crop centred on the sun, with the horizon high up so the
          headline sits on the dark water. The sea extends below the wide frame for this. */}
      <svg
        viewBox="800 455 380 775"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full sm:hidden"
      >
        <Scene id="hero-tall" reflection={false} />
      </svg>
    </div>
  );
}

/**
 * The scene's shapes. `id` keeps gradient ids unique when it is drawn twice;
 * `reflection` is off on phones, where it would run through the headline.
 */
function Scene({ id, reflection }: { id: string; reflection: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16314a" />
          <stop offset="0.35" stopColor="#7a5a73" />
          <stop offset="0.62" stopColor="#f9785c" />
          <stop offset="0.78" stopColor="#ffc9bb" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.62" cy="0.6" r="0.45">
          <stop offset="0" stopColor="#ffe5de" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe5de" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2452b" />
          <stop offset="0.25" stopColor="#7a5a73" />
          <stop offset="1" stopColor="#0f2a3d" />
        </linearGradient>
        <linearGradient id={`${id}-lagoon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fbcb4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#145451" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Sky and the glow around the setting sun */}
      <rect width="1600" height="640" fill={`url(#${id}-sky)`} />
      <rect width="1600" height="640" fill={`url(#${id}-glow)`} />
      <circle cx="990" cy="618" r="86" fill="#ffe5de" />

      {/* Ocean with the sun's reflection */}
      <rect y="618" width="1600" height="700" fill={`url(#${id}-sea)`} />
      {reflection && (
        <g fill="#ffe5de" opacity="0.75">
          <rect x="930" y="636" width="120" height="4" rx="2" />
          <rect x="948" y="656" width="84" height="3" rx="1.5" />
          <rect x="962" y="676" width="56" height="3" rx="1.5" />
          <rect x="974" y="698" width="32" height="2" rx="1" />
        </g>
      )}

      {/* Mountain silhouette rising from the coast on the left */}
      <path
        d="M0 640 L0 470 C60 455 110 440 150 400 C185 365 205 300 240 286 C280 270 300 300 330 318 C380 350 420 390 470 430 C540 486 610 560 720 620 L740 640 Z"
        fill="#0f2a3d"
      />
      <path
        d="M0 640 L0 540 C120 520 240 560 360 590 C450 612 560 628 640 640 Z"
        fill="#0a1c2a"
        opacity="0.8"
      />

      {/* Reef line where the waves break, and the lagoon inside it */}
      <path
        d="M0 760 C300 735 600 742 900 760 C1150 775 1400 770 1600 752"
        stroke="#ffe5de"
        strokeOpacity="0.55"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M0 770 C300 745 600 752 900 770 C1150 785 1400 780 1600 762 L1600 1300 L0 1300 Z"
        fill={`url(#${id}-lagoon)`}
      />
      <g stroke="#d5f4f1" strokeOpacity="0.25" strokeWidth="2" fill="none">
        <path d="M80 850 C240 838 400 846 560 852" />
        <path d="M700 880 C900 868 1100 874 1300 884" />
        <path d="M260 930 C460 918 660 926 860 934" />
      </g>
    </>
  );
}
