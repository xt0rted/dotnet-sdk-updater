import {
  readFile,
  writeFile,
} from "node:fs/promises";
import {
  join,
  resolve,
} from "node:path";

import {
  debug,
  warning,
} from "@actions/core";
import { jest } from "@jest/globals";
import JSON5 from "json5";

import { replaceVersion } from "./regex";

interface GlobalJson {
  sdk: {
    allowPrerelease: boolean;
    version: string;
  };
}

export function mapConfigFile(appRoot: string) {
  const fullLocation = resolve(join(appRoot, "global.json"));

  debug(`Using global.json at: ${fullLocation}`);

  return fullLocation;
}

export async function loadSdkVersion(configFile: string): Promise<string> {
  const fileContents = await readFile(configFile, { encoding: "utf8" });
  const globalConfig = JSON5.parse<GlobalJson>(fileContents);

  return globalConfig.sdk.version;
}

export async function updateSdkVersion(configFile: string, versionFrom: string, versionTo: string, dryRun: boolean): Promise<void> {
  debug(`Updating global.json from ${versionFrom} to ${versionTo}`);

  const fileContents = await readFile(configFile, { encoding: "utf8" });
  const newFileContents = replaceVersion(fileContents, versionFrom, versionTo);

  debug(`Original file contents: ${fileContents}`);
  debug(`New file contents: ${newFileContents}`);

  if (!dryRun) {
    await writeFile(configFile, newFileContents, { encoding: "utf8" });
  } else {
    warning("Skipping write due to dry_run set to true");
  }
}
