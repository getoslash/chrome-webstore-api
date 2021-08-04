import { APIClient, default as apiClient } from "../mod.ts";
import { ACCESS_TOKEN } from "./fixtures/accessToken.ts";
import { CLIENT_OPTIONS } from "./fixtures/clientOptions.ts";

export const fixtures = {
  accessToken: ACCESS_TOKEN,
  clientOptions: CLIENT_OPTIONS,
} as const;

export const getClient = (): APIClient => {
  return new APIClient(CLIENT_OPTIONS);
};

export const getDefaultExportClient = (
  options: typeof CLIENT_OPTIONS,
): APIClient => {
  return apiClient(options);
};

export const getToken = (): Promise<string> => {
  return Promise.resolve(ACCESS_TOKEN);
};
