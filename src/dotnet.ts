import fetch from "node-fetch";

const RELEASES_INDEX_ENDPOINT = "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json";

interface DotNetReleases {
  "releases-index": DotNetRelease[];
}

interface DotNetRelease {
  "channel-version": string;
  "latest-sdk": string;
}

export async function findLatestSdkVersion(versionChannel: string): Promise<string> {
  const response = await fetch(RELEASES_INDEX_ENDPOINT);
  const releases = await response.json() as DotNetReleases;

  const versionDetails = releases["releases-index"].find((release) => release["channel-version"] === versionChannel);

  if (!versionDetails) {
    throw new Error(`Version channel '${versionChannel}' not found in releases-index.json`);
  }

  return versionDetails["latest-sdk"];
}
