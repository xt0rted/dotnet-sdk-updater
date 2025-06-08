import {
  afterAll,
  afterEach,
  beforeAll,
  vi,
} from "vitest";

import { server } from "./mocks/node.js";

vi.mock(import("node:fs/promises"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    writeFile: vi.fn(),
  };
});

vi.mock(import("@actions/core"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    debug: vi.fn(),
    error: vi.fn(),
    setFailed: vi.fn(),
    setOutput: vi.fn(),
    warning: vi.fn(),
  };
});

beforeAll(() => {
  server.listen({
    onUnhandledRequest(request, print) {
      print.error();
    },
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
