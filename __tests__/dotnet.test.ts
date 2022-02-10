import { fileURLToPath } from "node:url";

import nock from "nock";

import { findLatestSdkVersion } from "../src/dotnet";

describe("dotnet", () => {
  let scope: nock.Scope;

  beforeEach(() => {
    const snapshotPath = fileURLToPath(new URL("dotnet-releases.json", import.meta.url));

    scope = nock("https://dotnetcli.blob.core.windows.net")
      .get("/dotnet/release-metadata/releases-index.json")
      .replyWithFile(200, snapshotPath, { "Content-Type": "application/json" });
  });

  afterEach(() => {
    expect(scope.isDone()).toBe(true);
  });

  it("finds the latest version for 2.2", async () => {
    await expect(findLatestSdkVersion("2.2")).resolves.toBe("2.2.207");
  });

  it("finds the latest version for 6.0", async () => {
    await expect(findLatestSdkVersion("6.0")).resolves.toBe("6.0.102");
  });

  it("doesn't find a version for 1.3", async () => {
    await expect(findLatestSdkVersion("1.3")).rejects.toThrow("Version channel '1.3' not found in releases-index.json");
  });
});
