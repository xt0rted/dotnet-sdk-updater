import { findLatestSdkVersion } from "../src/dotnet";
import { mockHttpRequests } from "./utils";

describe("dotnet", () => {
  beforeAll(() => {
    mockHttpRequests();
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
