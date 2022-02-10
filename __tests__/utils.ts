/* eslint-disable no-console */
import { jest } from "@jest/globals";

const enableLogging = false;

export function mockWithLogging(name: string) {
  return jest.fn((...arguments_: unknown[]): void => {
    if (enableLogging) {
      console.info(name, ...arguments_);
    }
  });
}
