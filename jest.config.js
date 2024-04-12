/** @type {import("ts-jest").JestConfigWithTsJest} */
export default {
  clearMocks: true,
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  preset: "ts-jest/presets/default-esm",
  resetMocks: true,
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testRunner: "jest-circus/runner",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: true,
        useESM: true,
      },
    ],
  },
  verbose: true,
};
