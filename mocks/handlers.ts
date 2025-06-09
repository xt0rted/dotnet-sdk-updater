import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  HttpResponse,
  http,
} from "msw";

// eslint-disable-next-line no-duplicate-imports
import type { JsonBodyType } from "msw";

export const handlers = [
  buildHandler("https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json", "dotnet-releases-index.json"),
  buildHandler("https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/2.2/releases.json", "dotnet-2.2-releases.json"),
  buildHandler("https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/6.0/releases.json", "dotnet-6.0-releases.json"),
];

function buildHandler(url: string, payloadFile: string) {
  return http.get(url, async () => {
    const payload = await loadPayload(payloadFile);

    return HttpResponse.json(payload);
  });
}

async function loadPayload(name: string): Promise<JsonBodyType> {
  const filePath = fileURLToPath(new URL("payloads/" + name, import.meta.url));

  const json = await readFile(filePath, "utf8");

  return JSON.parse(json) as JsonBodyType;
}
