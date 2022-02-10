import { debug } from "@actions/core";

import fetch from "node-fetch";

const LATEST_VERSION_ENDPOINT = "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json";

interface DotNetReleases {
  "releases-index": DotNetRelease[];
}

interface DotNetRelease {
  "channel-version": string;
  "latest-sdk": string;
}

export async function findLatestSdkVersion(versionChannel: string): Promise<string> {
  const response = await fetch(LATEST_VERSION_ENDPOINT);
  const releases = await response.json() as DotNetReleases;

  const versionDetails = releases["releases-index"].find((release) => release["channel-version"] === versionChannel);

  if (!versionDetails) {
    throw new Error(`Version channel '${versionChannel}' not found in releases-index.json`);
  }

  debug(`Version details: ${JSON.stringify(versionDetails, undefined, 2)}`);

  return versionDetails["latest-sdk"];
}
