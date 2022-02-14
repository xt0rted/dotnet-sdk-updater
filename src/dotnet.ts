import fetch from "node-fetch";

const RELEASES_INDEX_ENDPOINT = "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json";

interface ReleaseBase {
  "channel-version": string;
  "eol-date": string;
  "latest-release-date": string;
  "latest-release": string;
  "latest-runtime": string;
  "latest-sdk": string;
  "support-phase": string;
}

interface ReleasesIndex {
  "releases-index": DotNetChannelRelease[];
}

interface DotNetChannelRelease extends ReleaseBase {
  product: string;
  "releases.json": string;
  security: boolean;
}

export async function findLatestSdkVersion(versionChannel: string): Promise<ReleaseDetails> {
  const response = await fetch(RELEASES_INDEX_ENDPOINT);
  const releases = await response.json() as ReleasesIndex;

  const versionDetails = releases["releases-index"].find((release) => release["channel-version"] === versionChannel);

  if (!versionDetails) {
    throw new Error(`Version channel '${versionChannel}' not found in releases-index.json`);
  }

  const details = await releaseDetails(versionDetails["releases.json"]);

  return details;
}

interface DotNetChannel extends ReleaseBase {
  "lifecycle-policy": string;
  releases: Array<{
    "release-date": string;
    "release-version": string;
    security: boolean;
    "cve-list": Array<{
      "cve-id": string;
      "cve-url": string;
    }>;
    "release-notes": string;
    sdk: {
      version: string;
      "runtime-version": string;
    };
  }>;
}

export interface ReleaseDetails {
  channel: string;
  latestRelease: string;
  latestReleaseDate: string;
  latestSdk: string;
  releaseNotes: string;
  securityRelease: boolean;
  cveList?: Array<{
    id: string;
    url: string;
  }>;
}

async function releaseDetails(releaseUrl: string): Promise<ReleaseDetails> {
  const response = await fetch(releaseUrl);
  const {
    "channel-version": channel,
    "latest-release": latestRelease,
    "latest-release-date": latestReleaseDate,
    "latest-sdk": latestSdk,
    releases,
  } = await response.json() as DotNetChannel;

  const {
    "release-notes": releaseNotes,
    security: securityRelease,
    "cve-list": cveList,
  } = releases[0];

  const details: ReleaseDetails = {
    channel,
    latestRelease,
    latestReleaseDate,
    latestSdk,
    releaseNotes,
    securityRelease,
  };

  if (cveList?.length) {
    details.cveList = cveList.map((cve) => ({
      id: cve["cve-id"],
      url: cve["cve-url"],
    }));
  }

  return details;
}
