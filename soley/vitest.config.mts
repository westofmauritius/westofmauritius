import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for plain logic (calculator, routing, validation, i18n keys).
// Whole-flow browser tests live in e2e/ and run with Playwright.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
      "@messages": fileURLToPath(new URL("./messages", import.meta.url)),
      // `server-only` throws outside a React server build; in unit tests the
      // code is plain Node, so it is replaced by an empty module.
      "server-only": fileURLToPath(
        new URL("./src/test/empty.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "content/**/*.test.ts"],
    environment: "node",
  },
});
