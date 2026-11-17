import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests cover the accounting engine and the scenario files.
// The UI is checked by running the app.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
