import assert from "node:assert/strict";
import {
  beforeEach,
  describe,
  it,
} from "node:test";
import { fileURLToPath } from "node:url";

import esmock from "esmock";

import type { updateSdkVersion as updateSdkVersionType } from "../src/global-json";

interface GlobalJson {
  updateSdkVersion: typeof updateSdkVersionType;
}

describe("global-json", () => {
  let configFile: string;

  beforeEach(() => {
    configFile = fileURLToPath(new URL("configs/global.json", import.meta.url));
  });

  describe("mapConfigFile", () => {
    it("returns the correct path", async () => {
      const { mapConfigFile } = await import("../src/global-json");

      assert.equal(mapConfigFile("./__tests__/configs"), configFile);
    });
  });

  describe("loadSdkVersion", () => {
    it("returns the correct version", async () => {
      const { loadSdkVersion } = await import("../src/global-json");

      assert.equal(await loadSdkVersion(configFile), "6.0.1");
    });
  });

  describe("updateSdkVersion", () => {
    it("updates the version when not a dry run", async (ctx) => {
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

      const writeFileMock = ctx.mock.fn();
      const globalJson = await esmock(
        "../src/global-json",
        import.meta.url,
        {},
        { "node:fs/promises": { writeFile: writeFileMock } },
      ) as GlobalJson;

      await globalJson.updateSdkVersion(configFile, "6.0.1", "6.0.102", false);

      assert.equal(writeFileMock.mock.callCount(), 1);
      assert.deepEqual(writeFileMock.mock.calls[0].arguments, [
        configFile,
        expectedFileResult,
        { encoding: "utf8" },
      ]);
    });

    it("doesn't update the version when a dry run", async (ctx) => {
      const writeFileMock = ctx.mock.fn();
      const globalJson = await esmock(
        "../src/global-json",
        import.meta.url,
        {},
        { "node:fs/promises": { writeFile: writeFileMock } },
      ) as GlobalJson;

      await globalJson.updateSdkVersion(configFile, "6.0.1", "6.0.102", true);

      assert.equal(writeFileMock.mock.callCount(), 0);
    });
  });
});
