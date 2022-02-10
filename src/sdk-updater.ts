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
    const updateRequired = semver.gt(latestVersion, sdkVersion);

    debug(`Dry run: ${dryRun ? "yes" : "no"}`);
    debug(`Current SDK version: ${sdkVersion}`);
    debug(`Latest SDK version: ${latestVersion}`);
    debug(`Update required: ${updateRequired ? "yes" : "no"}`);

    if (updateRequired) {
      await updateSdkVersion(configFile, sdkVersion, latestVersion, dryRun);

      setOutput("updated-version-from", sdkVersion);
      setOutput("updated-version-to", latestVersion);
    }

    setOutput("dry-run", dryRun);
    setOutput("updated", updateRequired);
  } catch (error_) {
    error(error_ as Error);
    setFailed((error_ as Error).message);
  }
}
