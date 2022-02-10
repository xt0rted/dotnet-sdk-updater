import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

jest.unstable_mockModule("node:fs/promises", () => ({
  __esModule: true,
  ...(jest.requireActual("node:fs/promises") as object),
  writeFile: jest.fn(),
}));

describe("global-json", () => {
  let configFile: string;

  beforeEach(() => {
    configFile = fileURLToPath(new URL("configs/global.json", import.meta.url));
  });

  describe("mapConfigFile", () => {
    it("returns the correct path", async () => {
      const { mapConfigFile } = await import("../src/global-json");

      expect(mapConfigFile("./__tests__/configs")).toBe(configFile);
    });
  });

  describe("loadSdkVersion", () => {
    it("returns the correct version", async () => {
      const { loadSdkVersion } = await import("../src/global-json");

      await expect(loadSdkVersion(configFile)).resolves.toBe("6.0.1");
    });
  });

  describe("updateSdkVersion", () => {
    it("updates the version when not a dry run", async () => {
      const expectedFileResult = `{
  "tools": {
    "dotnet": "6.0.101",
    "vs": {
      "version": "6.0.1"
    },
    "xcopy-msbuild": "16.8.0-preview2.1"
  },
  "msbuild-sdks": {
    "Microsoft.DotNet.Arcade.Sdk": "7.0.0-beta.22103.1"
  },
  "sdk": {
    // The sdk "version": "6.0.1"
    "version": "6.0.102",
    // Allow prerelease versions
    "allowPrerelease": false,
    "rollForward": "disable"
  }
}
`;

      const { writeFile } = await import("node:fs/promises");
      const { updateSdkVersion } = await import("../src/global-json");

      await updateSdkVersion(configFile, "6.0.1", "6.0.102", false);

      expect(writeFile).toHaveBeenCalledWith(
        configFile,
        expectedFileResult,
        expect.objectContaining({ encoding: "utf8" }),
      );
    });

    it("doesn't update the version when a dry run", async () => {
      const { writeFile } = await import("node:fs/promises");
      const { updateSdkVersion } = await import("../src/global-json");

      await updateSdkVersion(configFile, "6.0.1", "6.0.102", true);

      expect(writeFile).not.toHaveBeenCalled();
    });
  });
});
