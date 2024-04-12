const RELEASES_INDEX_ENDPOINT = "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json";

interface ReleaseBase {
  "channel-version": string;
  "eol-date": string;
  "latest-release": string;
  "latest-release-date": string;
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
    "cve-list": Array<{
      "cve-id": string;
      "cve-url": string;
    }>;
    "release-date": string;
    "release-notes": string;
    "release-version": string;
    sdk: {
      "runtime-version": string;
      version: string;
    };
    security: boolean;
  }>;
}

export interface ReleaseDetails {
  channel: string;
  cveList?: Array<{
    id: string;
    url: string;
  }>;
  latestRelease: string;
  latestReleaseDate: string;
  latestSdk: string;
  releaseNotes: string;
  securityRelease: boolean;
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
    "cve-list": cveList,
    "release-notes": releaseNotes,
    security: securityRelease,
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
