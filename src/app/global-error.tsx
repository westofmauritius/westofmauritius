"use client";

/**
 * Last-resort error page, used only if the root layout itself fails. It must
 * render its own <html> and cannot rely on the site's styles or fonts.
 */
export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Georgia, serif",
          background: "#0f2a3d",
          color: "#ffffff",
          textAlign: "center",
          padding: 24,
        }}
      >
        <main>
          <h1 style={{ fontWeight: 400, fontSize: 40 }}>West Mauritius</h1>
          <p style={{ fontFamily: "system-ui, sans-serif" }}>
            Something went wrong. / Un problème est survenu.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 24px",
              borderRadius: 999,
              border: 0,
              background: "#ffffff",
              color: "#0f2a3d",
              cursor: "pointer",
            }}
          >
            Try again / Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
