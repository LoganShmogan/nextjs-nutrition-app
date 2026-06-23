import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/mock-data/**"],
    },
  },
});
