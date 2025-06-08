import { jest } from "@jest/globals";

import {
  mockHttpRequests,
  mockWithLogging,
  resetMocks,
} from "./utilities";

jest.unstable_mockModule("node:fs/promises", () => ({
  __esModule: true,
  ...jest.requireActual<object>("node:fs/promises"),
  writeFile: mockWithLogging("writeFile"),
}));

jest.unstable_mockModule("@actions/core", () => ({
  __esModule: true,
  ...jest.requireActual<object>("@actions/core"),
  debug: mockWithLogging("debug"),
  setFailed: mockWithLogging("setFailed"),
  setOutput: mockWithLogging("setOutput"),
}));

describe("sdk-updater", () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    mockHttpRequests();
    process.env = { ...originalEnvironment };
  });

  afterEach(() => {
    resetMocks();
    process.env = originalEnvironment;
  });

  it("gracefully handles exceptions", async () => {
    const { setFailed } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith("Input required and not supplied: dry-run");
  });

  it("sets outputs when version is not updated", async () => {
    process.env["INPUT_DRY-RUN"] = "false";
    process.env["INPUT_FILE-LOCATION"] = "./__tests__/configs/up-to-date";

    const { writeFile } = await import("node:fs/promises");
    const { setOutput } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(writeFile).toHaveBeenCalledTimes(0);

    expect(setOutput).toHaveBeenCalledWith("dry-run", false);
    expect(setOutput).toHaveBeenCalledWith("updated", false);
  });

  it("sets outputs when version is updated", async () => {
    process.env["INPUT_DRY-RUN"] = "false";
    process.env["INPUT_FILE-LOCATION"] = "./__tests__/configs";

    const { writeFile } = await import("node:fs/promises");
    const { setOutput } = await import("@actions/core");
    const { run } = await import("../src/sdk-updater");

    await expect(run()).resolves.not.toThrow();

    expect(writeFile).toHaveBeenCalledTimes(1);

    expect(setOutput).toHaveBeenCalledWith("dry-run", false);
    expect(setOutput).toHaveBeenCalledWith("updated", true);
    expect(setOutput).toHaveBeenCalledWith("updated-version-from", "6.0.1");
    expect(setOutput).toHaveBeenCalledWith("updated-version-to", "6.0.102");
    expect(setOutput).toHaveBeenCalledWith("update-type", "patch");
  });
});
