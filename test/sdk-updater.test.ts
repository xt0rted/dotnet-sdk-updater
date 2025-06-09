import * as fs from "node:fs/promises";

import * as core from "@actions/core";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { run } from "../src/sdk-updater.js";

describe("sdk-updater", () => {
  it("gracefully handles exceptions", async () => {
    const setFailedSpy = vi.spyOn(core, "setFailed");

    await expect(run()).resolves.not.toThrow();

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith("Input required and not supplied: dry-run");
  });

  it("sets outputs when version is not updated", async () => {
    vi.stubEnv("INPUT_DRY-RUN", "false");
    vi.stubEnv("INPUT_FILE-LOCATION", "./test/configs/up-to-date");

    const writeFileSpy = vi.spyOn(fs, "writeFile");
    const setOutputSpy = vi.spyOn(core, "setOutput");

    await expect(run()).resolves.not.toThrow();

    expect(writeFileSpy).toHaveBeenCalledTimes(0);

    expect(setOutputSpy).toHaveBeenCalledWith("dry-run", false);
    expect(setOutputSpy).toHaveBeenCalledWith("updated", false);
  });

  it("sets outputs when version is updated", async () => {
    vi.stubEnv("INPUT_DRY-RUN", "false");
    vi.stubEnv("INPUT_FILE-LOCATION", "./test/configs");

    const writeFileSpy = vi.spyOn(fs, "writeFile");
    const setOutputSpy = vi.spyOn(core, "setOutput");

    await expect(run()).resolves.not.toThrow();

    expect(writeFileSpy).toHaveBeenCalledTimes(1);

    expect(setOutputSpy).toHaveBeenCalledWith("dry-run", false);
    expect(setOutputSpy).toHaveBeenCalledWith("updated", true);
    expect(setOutputSpy).toHaveBeenCalledWith("updated-version-from", "6.0.1");
    expect(setOutputSpy).toHaveBeenCalledWith("updated-version-to", "6.0.102");
    expect(setOutputSpy).toHaveBeenCalledWith("update-type", "patch");
  });
});
