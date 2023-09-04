import { fileURLToPath } from "node:url";

import nock from "nock";

nock.disableNetConnect();

export function mockHttpRequests() {
  nock("https://dotnetcli.blob.core.windows.net")
    .persist()
    .get("/dotnet/release-metadata/releases-index.json")
    .replyWithFile(
      200,
      fileURLToPath(new URL("payloads/dotnet-releases-index.json", import.meta.url)),
      { "Content-Type": "application/json" },
    );

  nock("https://dotnetcli.blob.core.windows.net")
    .persist()
    .get("/dotnet/release-metadata/2.2/releases.json")
    .replyWithFile(
      200,
      fileURLToPath(new URL("payloads/dotnet-2.2-releases.json", import.meta.url)),
      { "Content-Type": "application/json" },
    );

  nock("https://dotnetcli.blob.core.windows.net")
    .persist()
    .get("/dotnet/release-metadata/6.0/releases.json")
    .replyWithFile(
      200,
      fileURLToPath(new URL("payloads/dotnet-6.0-releases.json", import.meta.url)),
      { "Content-Type": "application/json" },
    );
}
