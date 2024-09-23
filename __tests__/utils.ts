import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

const enableLogging = false;
const globalFetch = global.fetch;

export function mockHttpRequests() {
  global.fetch = jest
    .fn<typeof global.fetch>()
    .mockImplementation((input: RequestInfo | URL, _init?: RequestInit) => {
      let payloadFile: string;

      switch (input) {
        case "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json": {
          payloadFile = "dotnet-releases-index.json";
          break;
        }
        case "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/2.2/releases.json": {
          payloadFile = "dotnet-2.2-releases.json";
          break;
        }
        case "https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/6.0/releases.json": {
          payloadFile = "dotnet-6.0-releases.json";
          break;
        }
        default: {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          throw new Error(`Unexpected input: ${input.toString()}`);
        }
      }

      return Promise.resolve({
        ok: true,
        json: () => loadPayload(payloadFile),
      } as Response);
    });
}

export function resetMocks() {
  global.fetch = globalFetch;
}

async function loadPayload(name: string): Promise<unknown> {
  const filePath = fileURLToPath(new URL("payloads/" + name, import.meta.url));

  const json = await readFile(filePath, "utf8");

  return JSON.parse(json) as unknown;
}

export function mockWithLogging(name: string) {
  return jest.fn((...arguments_: unknown[]): void => {
    if (enableLogging) {
      // eslint-disable-next-line no-console
      console.info(name, ...arguments_);
    }
  });
}
