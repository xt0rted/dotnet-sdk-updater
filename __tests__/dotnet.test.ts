import { findLatestSdkVersion } from "../src/dotnet";
import {
  mockHttpRequests,
  resetMocks,
} from "./utils";

describe("dotnet", () => {
  beforeEach(() => {
    mockHttpRequests();
  });

  afterEach(() => {
    resetMocks();
  });

  it("finds the latest version for 2.2", async () => {
    await expect(findLatestSdkVersion("2.2")).resolves.toStrictEqual({
      channel: "2.2",
      latestRelease: "2.2.8",
      latestReleaseDate: "2019-11-19",
      latestSdk: "2.2.207",
      releaseNotes: "https://github.com/dotnet/core/blob/master/release-notes/2.2/2.2.8/2.2.8.md",
      securityRelease: false,
    });
  });

  it("finds the latest version for 6.0", async () => {
    await expect(findLatestSdkVersion("6.0")).resolves.toStrictEqual({
      channel: "6.0",
      cveList: [
        {
          id: "CVE-2022-21986",
          url: "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-21986",
        },
      ],
      latestRelease: "6.0.2",
      latestReleaseDate: "2022-02-08",
      latestSdk: "6.0.102",
      releaseNotes: "https://github.com/dotnet/core/blob/main/release-notes/6.0/6.0.2/6.0.2.md",
      securityRelease: true,
    });
  });

  it("doesn't find a version for 1.3", async () => {
    await expect(findLatestSdkVersion("1.3")).rejects.toThrow("Version channel '1.3' not found in releases-index.json");
  });
});
