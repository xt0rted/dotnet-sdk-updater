import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";
import nock from "nock";

import { mockWithLogging } from "./utils";

jest.unstable_mockModule("node:fs/promises", () => ({
  __esModule: true,
  ...(jest.requireActual("node:fs/promises") as object),
  writeFile: mockWithLogging("writeFile"),
}));

jest.unstable_mockModule("@actions/core", () => ({
  __esModule: true,
  ...(jest.requireActual("@actions/core") as object),
  debug: mockWithLogging("debug"),
  setFailed: mockWithLogging("setFailed"),
  setOutput: mockWithLogging("setOutput"),
}));

describe("sdk-updater", () => {
  const originalEnvironment = process.env;

  beforeAll(() => {
    const snapshotPath = fileURLToPath(new URL("dotnet-releases.json", import.meta.url));

    nock("https://dotnetcli.blob.core.windows.net")
      .persist()
      .get("/dotnet/release-metadata/releases-index.json")
      .replyWithFile(200, snapshotPath, { "Content-Type": "application/json" });
  });

  beforeEach(() => {
    process.env = { ...originalEnvironment };
  });

  afterEach(() => {
    process.env = originalEnvironment;
  });

  it("gracefully handles exceptions", async () => {
    const { setFailed } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith("Input required and not supplied: dry_run");
  });

  it("sets outputs when version is updated", async () => {
    process.env.INPUT_DRY_RUN = "false";
    process.env.INPUT_FILE_LOCATION = "./__tests__/configs/up-to-date";

    const { writeFile } = await import("node:fs/promises");
    const { setOutput } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(writeFile).toHaveBeenCalledTimes(0);

    expect(setOutput).toHaveBeenCalledTimes(1);
    expect(setOutput).toHaveBeenNthCalledWith(1, "updated", false);
  });

  it("sets outputs when version is not updated", async () => {
    process.env.INPUT_DRY_RUN = "false";
    process.env.INPUT_FILE_LOCATION = "./__tests__/configs";

    const { writeFile } = await import("node:fs/promises");
    const { setOutput } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(writeFile).toHaveBeenCalledTimes(1);

    expect(setOutput).toHaveBeenCalledTimes(3);
    expect(setOutput).toHaveBeenNthCalledWith(1, "updated-version-from", "6.0.1");
    expect(setOutput).toHaveBeenNthCalledWith(2, "updated-version-to", "6.0.102");
    expect(setOutput).toHaveBeenNthCalledWith(3, "updated", true);
  });
});
