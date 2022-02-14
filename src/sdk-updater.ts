import {
  debug,
  error,
  getBooleanInput,
  getInput,
  setFailed,
  setOutput,
} from "@actions/core";

import semver from "semver";

import { findLatestSdkVersion } from "./dotnet";
import {
  loadSdkVersion,
  mapConfigFile,
  updateSdkVersion,
} from "./global-json";

export async function run(): Promise<void> {
  try {
    const dryRun = getBooleanInput("dry-run", {
      required: true,
      trimWhitespace: true,
    });
    const appRoot = getInput("file-location", {
      required: true,
      trimWhitespace: true,
    });

    const configFile = mapConfigFile(appRoot);
    const sdkVersion = await loadSdkVersion(configFile);
    const [major, minor] = sdkVersion.split(".");
    const latestVersion = await findLatestSdkVersion(`${major}.${minor}`);
    const updateRequired = semver.gt(latestVersion.latestSdk, sdkVersion);

    debug(`Dry run: ${dryRun ? "yes" : "no"}`);
    debug(`Current SDK version: ${sdkVersion}`);
    debug(`Latest SDK version: ${latestVersion.latestSdk}`);
    debug(`Update required: ${updateRequired ? "yes" : "no"}`);

    if (updateRequired) {
      await updateSdkVersion(configFile, sdkVersion, latestVersion.latestSdk, dryRun);

      setOutput("channel", latestVersion.channel);
      setOutput("cve-list", latestVersion.cveList);
      setOutput("release-date", latestVersion.latestReleaseDate);
      setOutput("release-notes", latestVersion.releaseNotes);
      setOutput("release-version", latestVersion.latestRelease);
      setOutput("security-release", latestVersion.securityRelease);
      setOutput("updated-version-from", sdkVersion);
      setOutput("updated-version-to", latestVersion.latestSdk);
      setOutput("update-type", semver.diff(sdkVersion, latestVersion.latestSdk));
    }

    setOutput("dry-run", dryRun);
    setOutput("updated", updateRequired);
  } catch (error_) {
    error(error_ as Error);
    setFailed((error_ as Error).message);
  }
}
