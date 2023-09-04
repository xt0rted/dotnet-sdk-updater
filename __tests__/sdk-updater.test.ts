import assert from "node:assert/strict";
import {
  afterEach,
  before,
  beforeEach,
  describe,
  it,
} from "node:test";

import esmock from "esmock";

import type { run as runType } from "../src/sdk-updater";
import { mockHttpRequests } from "./utils";

interface SdkUpdater {
  run: typeof runType;
}

describe("sdk-updater", () => {
  const originalEnvironment = process.env;

  before(() => {
    mockHttpRequests();
  });

  beforeEach(() => {
    process.env = { ...originalEnvironment };
  });

  afterEach(() => {
    process.env = originalEnvironment;
  });

  it("gracefully handles exceptions", async (ctx) => {
    const setFailedMock = ctx.mock.fn();
    const sdkUpdater = await esmock(
      "../src/sdk-updater",
      {},
      { "@actions/core": { setFailed: setFailedMock } },
    ) as SdkUpdater;

    await assert.doesNotReject(async () => await sdkUpdater.run());

    assert.equal(setFailedMock.mock.callCount(), 1);
    assert.deepEqual(setFailedMock.mock.calls[0].arguments, ["Input required and not supplied: dry-run"]);
  });

  it("sets outputs when version is not updated", async (ctx) => {
    process.env["INPUT_DRY-RUN"] = "false";
    process.env["INPUT_FILE-LOCATION"] = "./__tests__/configs/up-to-date";

    const setFailedMock = ctx.mock.fn();
    const setOutputMock = ctx.mock.fn();
    const writeFileMock = ctx.mock.fn();

    const sdkUpdater = await esmock(
      "../src/sdk-updater",
      import.meta.url,
      {},
      {
        "node:fs/promises": { writeFile: writeFileMock },
        "@actions/core": {
          debug: ctx.mock.fn(),
          setFailed: setFailedMock,
          setOutput: setOutputMock,
        },
      },
    ) as SdkUpdater;

    await assert.doesNotReject(async () => await sdkUpdater.run());

    assert.equal(writeFileMock.mock.callCount(), 0);
    assert.equal(setOutputMock.mock.callCount(), 2);
    assert.deepEqual(setOutputMock.mock.calls[0].arguments, ["dry-run", false]);
    assert.deepEqual(setOutputMock.mock.calls[1].arguments, ["updated", false]);
  });

  it("sets outputs when version is updated", async (ctx) => {
    process.env["INPUT_DRY-RUN"] = "false";
    process.env["INPUT_FILE-LOCATION"] = "./__tests__/configs";

    const setFailedMock = ctx.mock.fn();
    const setOutputMock = ctx.mock.fn();
    const writeFileMock = ctx.mock.fn();

    const sdkUpdater = await esmock(
      "../src/sdk-updater",
      import.meta.url,
      {},
      {
        "node:fs/promises": { writeFile: writeFileMock },
        "@actions/core": {
          debug: ctx.mock.fn(),
          setFailed: setFailedMock,
          setOutput: setOutputMock,
        },
      },
    ) as SdkUpdater;

    await assert.doesNotReject(async () => await sdkUpdater.run());

    assert.equal(writeFileMock.mock.callCount(), 1);
    assert.equal(setOutputMock.mock.callCount(), 11);
    assert.deepEqual(setOutputMock.mock.calls[0].arguments, ["channel", "6.0"]);
    assert.deepEqual(setOutputMock.mock.calls[1].arguments, ["cve-list", [{
      id: "CVE-2022-21986",
      url: "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-21986",
    }]]);
    assert.deepEqual(setOutputMock.mock.calls[2].arguments, ["release-date", "2022-02-08"]);
    assert.deepEqual(setOutputMock.mock.calls[3].arguments, ["release-notes", "https://github.com/dotnet/core/blob/main/release-notes/6.0/6.0.2/6.0.2.md"]);
    assert.deepEqual(setOutputMock.mock.calls[4].arguments, ["release-version", "6.0.2"]);
    assert.deepEqual(setOutputMock.mock.calls[5].arguments, ["security-release", true]);
    assert.deepEqual(setOutputMock.mock.calls[6].arguments, ["updated-version-from", "6.0.1"]);
    assert.deepEqual(setOutputMock.mock.calls[7].arguments, ["updated-version-to", "6.0.102"]);
    assert.deepEqual(setOutputMock.mock.calls[8].arguments, ["update-type", "patch"]);
    assert.deepEqual(setOutputMock.mock.calls[9].arguments, ["dry-run", false]);
    assert.deepEqual(setOutputMock.mock.calls[10].arguments, ["updated", true]);
  });
});
