"use client";

// Last-resort error page when the root layout itself fails. It cannot use
// translations (they are loaded by that layout), so it shows both languages.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: "3rem 1rem" }}>
        <h1>Something went wrong · Une erreur s’est produite</h1>
        <button type="button" onClick={reset} style={{ marginTop: "1rem" }}>
          Try again · Réessayer
        </button>
      </body>
    </html>
  );
}
