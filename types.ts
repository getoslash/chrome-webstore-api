export type PublishTarget = "default" | "trustedUsers";

/**
 * Options for the Google Web Store API client.
 *
 * @see https://developer.chrome.com/docs/webstore/using_webstore_api/ to learn
 * how to get the options from your Google account.
 */
export interface ClientOptions {
  /** ID of your Chrome Web Store item. */
  id: string;
  /** Client ID from the Google API Console. */
  clientId: string;
  /** Client secret (caution: sensitive) from the Google API Console. */
  clientSecret: string;
  /** Refresh token from the Google API. */
  refreshToken: string;
}

/**
 * @see https://developer.chrome.com/docs/webstore/using_webstore_api/
 */
export interface GoogleAPITokenResponse {
  // deno-lint-ignore camelcase
  access_token: string;
  // deno-lint-ignore camelcase
  token_type: string;
  // deno-lint-ignore camelcase
  expires_in: number;
  // deno-lint-ignore camelcase
  refresh_token: string;
}

/**
 * @see https://developer.chrome.com/docs/webstore/webstore_api/items/
 */
export interface GoogleAPIWebStoreItem {
  kind: "chromewebstore#item";
  /** Extension or app ID. */
  id: string;
  publicKey?: string;
  uploadState: "FAILURE" | "IN_PROGRESS" | "NOT_FOUND" | "SUCCESS";
  itemError?: Array<{
    error_code: string;
    error_detail: string;
  }>;
}

export interface GoogleAPIWebStorePublishSuccess {
  kind: "chromewebstore#item";
  // deno-lint-ignore camelcase
  item_id: string;
  status: Array<
    | "OK"
    | "NOT_AUTHORIZED"
    | "INVALID_DEVELOPER"
    | "DEVELOPER_NO_OWNERSHIP"
    | "DEVELOPER_SUSPENDED"
    | "ITEM_NOT_FOUND"
    | "ITEM_PENDING_REVIEW"
    | "ITEM_TAKEN_DOWN"
    | "PUBLISHER_SUSPENDED"
  >;
  statusDetail: Array<string>;
}

export interface GoogleAPIWebStorePublishFailure {
  error: {
    code: number;
    message: string;
    errors: Array<
      {
        message: string;
        domain: string;
        reason: string;
      }
    >;
  };
}

/**
 * @see https://developer.chrome.com/docs/webstore/webstore_api/items/publish/#response
 */
export type GoogleAPIWebStorePublishResponse =
  | GoogleAPIWebStorePublishSuccess
  | GoogleAPIWebStorePublishFailure;
