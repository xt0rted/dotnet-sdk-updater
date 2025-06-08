import { defineConfig } from "vitest/config";
import { isCI } from "std-env";

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      enabled: isCI,
      reportOnFailure: true,
      reporter: ["text", "html", "json", "json-summary"],
      include: ["src/**/*.ts"],
    },
    mockReset: true,
    restoreMocks: true,
    setupFiles: ["./vitest.setup.ts"],
    unstubEnvs: true,
  },
});
