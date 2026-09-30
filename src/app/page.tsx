// Temporary start page so we can confirm the project builds and runs.
// Replaced by the real, language-aware start page in step 7.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm tracking-[0.3em] uppercase">Coming soon</p>
      <h1 className="text-4xl">West Mauritius</h1>
      <p className="max-w-md">
        Tamarin, Black River, Le Morne, Flic en Flac, La Gaulette, Chamarel.
      </p>
    </main>
  );
}
