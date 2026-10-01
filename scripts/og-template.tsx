/**
 * Layout of the social sharing images (1200 × 630): brand mark, a small
 * label and the page title, over the page's main photo when it has one,
 * otherwise over a gradient in the site's colours. Rendered by
 * satori (HTML/CSS subset → SVG) in scripts/generate-og.tsx.
 */

export type OgTone = "lagoon" | "sunset" | "sand" | "ocean";

const backgrounds: Record<OgTone, string> = {
  lagoon: "linear-gradient(135deg, #3fbcb4 0%, #2e6590 55%, #0f2a3d 100%)",
  sunset:
    "linear-gradient(180deg, #f9785c 0%, #c2452b 35%, #7a5a73 65%, #0f2a3d 100%)",
  sand: "linear-gradient(135deg, #c9ab7e 0%, #3fbcb4 60%, #145451 100%)",
  ocean: "linear-gradient(135deg, #2e6590 0%, #16314a 60%, #0a1c2a 100%)",
};

export function OgTemplate({
  title,
  eyebrow,
  brand,
  tone = "sunset",
  photo,
}: {
  title: string;
  eyebrow?: string;
  brand: string;
  tone?: OgTone;
  /** The page's main photo, already cropped to 1200 × 630, as a data URL. */
  photo?: string;
}) {
  // Long titles get a smaller size so they never overflow three lines.
  const titleSize = title.length > 60 ? 60 : title.length > 36 ? 72 : 86;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundImage: backgrounds[tone],
        color: "white",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori, not a web page
        <img
          src={photo}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}
      {/* Darker top and bottom so the brand and the title always read well. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          backgroundImage: photo
            ? "linear-gradient(180deg, rgba(10,28,42,0.55) 0%, rgba(10,28,42,0.1) 30%, rgba(10,28,42,0.35) 55%, rgba(10,28,42,0.88) 100%)"
            : "linear-gradient(180deg, rgba(10,28,42,0) 20%, rgba(10,28,42,0.78) 100%)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 40,
              height: 20,
              borderRadius: "20px 20px 0 0",
              backgroundColor: "#ec5a3c",
            }}
          />
          <div
            style={{
              width: 52,
              height: 3,
              borderRadius: 2,
              backgroundColor: "white",
            }}
          />
          <div
            style={{
              width: 28,
              height: 3,
              borderRadius: 2,
              backgroundColor: "#79d6cf",
            }}
          />
        </div>
        <div style={{ fontFamily: "Garamond", fontSize: 38 }}>{brand}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#ffc9bb",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontFamily: "Garamond",
            fontSize: titleSize,
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
