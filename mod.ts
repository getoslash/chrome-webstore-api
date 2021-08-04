import { debugLog } from "./deps.ts";
import type {
  ClientOptions,
  GoogleAPITokenResponse,
  GoogleAPIWebStoreItem,
  GoogleAPIWebStorePublishResponse,
  PublishTarget,
} from "./types.ts";

const rootHost = "www.googleapis.com" as const;
const rootURI = `https://${rootHost}` as const;
const refreshTokenURI = `${rootURI}/oauth2/v4/token` as const;
const addURI = `${rootURI}/upload/chromewebstore/v1.1/items` as const;
const uploadURI = (extensionId: string): string =>
  `${rootURI}/upload/chromewebstore/v1.1/items/${extensionId}`;
const publishURI = (extensionId: string, target: PublishTarget): string => (
  `${rootURI}/chromewebstore/v1.1/items/${extensionId}/publish?publishTarget=${target}`
);
const checkStatusURI = (extensionId: string): string =>
  `${rootURI}/chromewebstore/v1.1/items/${extensionId}?projection=draft`;

export type APIClientOptions = ClientOptions;

/**
 * API client for interacting with the Chrome Web Store.
 */
export class APIClient {
  private readonly extensionId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;

  constructor(options: APIClientOptions) {
    if (!options.id) throw new Error("'id' is missing!");
    if (!options.clientId) throw new Error("'clientId' is missing!");
    if (!options.clientSecret) throw new Error("'clientSecret' is missing!");
    if (!options.refreshToken) throw new Error("'refreshToken' is missing!");
    this.extensionId = options.id;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.refreshToken = options.refreshToken;
  }

  /**
   * Get an OAuth2 access token.
   * @returns {GoogleAPITokenResponse['access_token']} Access token.
   */
  public async fetchToken(): Promise<GoogleAPITokenResponse["access_token"]> {
    const { clientId, clientSecret, refreshToken } = this;

    const debug = debugLog("cwa:token");
    debug("fetching refresh token from google");
    const request = await fetch(refreshTokenURI, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    debug("got refresh token from google");

    const response = await request
      .json() as GoogleAPITokenResponse;
    debug("refresh token response %j", response);
    return response.access_token;
  }

  /**
   * Upload a new package to the store.
   * @param {ReadableStream} readStream Readable stream of the file object to upload.
   * @param {Promise<string>} token Access token.
   * @returns {GoogleAPIWebStoreItem} Item upload state.
   */
  public async uploadNew(
    readStream: ReadableStream,
    token: Promise<string> = this.fetchToken(),
  ): Promise<GoogleAPIWebStoreItem> {
    if (!readStream) {
      throw new Error("Nothing to upload!");
    }

    const debug = debugLog("cwa:upload");
    debug("uploading new package to chrome store");
    const request = await fetch(addURI, {
      method: "POST",
      headers: this.buildHeaders(await token),
      body: readStream,
    });
    debug("finished uploading new package to chrome store");

    const response = await request.json() as GoogleAPIWebStoreItem;
    debug("upload response %j", response);
    return response;
  }

  /**
   * Upload a package to update an existing store item.
   * @param {ReadableStream<Uint8Array>} readStream Readable stream of the file object to upload.
   * @param {Promise<string>} token Access token.
   * @returns {GoogleAPIWebStoreItem} Item upload state.
   */
  public async uploadExisting(
    readStream: ReadableStream<Uint8Array>,
    token: Promise<string> = this.fetchToken(),
  ): Promise<GoogleAPIWebStoreItem> {
    if (!readStream) {
      throw new Error("Nothing to upload!");
    }

    const { extensionId } = this;

    const debug = debugLog("cwa:upload");
    debug("uploading existing package to chrome store");
    const request = await fetch(uploadURI(extensionId), {
      method: "PUT",
      headers: this.buildHeaders(await token),
      body: readStream,
    });
    debug("finished uploading existing package to chrome store");

    const response = await request.json() as GoogleAPIWebStoreItem;
    debug("upload response %j", response);
    return response;
  }

  /**
   * Publish a given extension ID on the Chrome Web store.
   * @param {PublishTarget} target Push to everyone or only to trusted testers.
   * @param {Promise<string>} token Access token.
   * @returns {GoogleAPIWebStorePublishResponse} Publish result.
   */
  public async publish(
    target: PublishTarget = "default",
    token: Promise<string> = this.fetchToken(),
  ): Promise<GoogleAPIWebStorePublishResponse> {
    const { extensionId } = this;

    const debug = debugLog("cwa:publish");
    debug("publishing package on chrome store");
    const request = await fetch(publishURI(extensionId, target), {
      method: "POST",
      headers: this.buildHeaders(await token),
    });
    debug("done publishing package on chrome store");

    const response = await request.json() as GoogleAPIWebStorePublishResponse;
    debug("publish response %j", response);
    return response;
  }

  /**
   * Check the upload status of an item.
   * @param {Promise<string>} token Access token.
   * @returns {GoogleAPIWebStoreItem} Item upload state.
   */
  public async checkUploadStatus(
    token: Promise<string> = this.fetchToken(),
  ): Promise<GoogleAPIWebStoreItem> {
    const { extensionId } = this;
    const debug = debugLog("cwa:check");
    debug("checking package upload status on chrome store");
    const request = await fetch(checkStatusURI(extensionId), {
      method: "GET",
      headers: this.buildHeaders(await token),
    });
    debug("done checking package upload status on chrome store");

    const response = await request.json() as GoogleAPIWebStoreItem;
    debug("check upload status response %j", response);
    return response;
  }

  /**
   * Build authorization headers for Google APIs.
   * @param {string} token Access token.
   * @returns {Record<string, string>} Headers as object.
   */
  private buildHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      "x-goog-api-version": "2",
    };
  }
}

/**
 * API client for interacting with the Chrome Web Store.
 */
const apiClient = (options: APIClientOptions) => new APIClient(options);

export default apiClient;
