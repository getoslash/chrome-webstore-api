<!-- deno-fmt-ignore-file -->
# Chrome Web Store API Client

[![deno version](https://img.shields.io/badge/deno-^1.12.2-lightgrey?logo=deno)](https://github.com/denoland/deno)
[![GitHub Release](https://img.shields.io/github/release/getoslash/chrome-webstore-api.svg)](https://github.com/getoslash/chrome-webstore-api/releases)
[![CI](https://github.com/getoslash/chrome-webstore-api/actions/workflows/ci.yml/badge.svg)](https://github.com/getoslash/chrome-webstore-api/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/getoslash/chrome-webstore-api/branch/main/graph/badge.svg?token=???)](https://codecov.io/gh/getoslash/chrome-webstore-api)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/getoslash/chrome-webstore-api)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/getoslash/chrome-webstore-api)

`cwa` is a simple Deno library for uploading & publishing your extensions and
themes to the
[Chrome Web Store](https://chrome.google.com/webstore/category/extensions).

If you're looking for an easy-to-use command-line version of this, check out
[`cwc`](https://github.com/getoslash/chrome-webstore-cli).

This draws inspiration heavily from Andrew's fantastic
[`chrome-webstore-upload`](https://github.com/DrewML/chrome-webstore-upload)
library (originally written for Node.js) and improves on it by offering a few
more API methods.

## Usage

You'll need Google API client ID, client secret and a refresh token.
[Learn how to get them](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md).

Once you have them, can you start using the client in your Deno project like
this —

```typescript
import { APIClient } from "https://deno.land/x/cwa@0.0.1/mod.ts";

const apiClient = new APIClient({
  // Note: These values are representative and don't actually work.
  id: "akjpoenbamadeeboawhkeljfvhngklfi",
  clientId:
    "618272284469-5hba9n4sc2hgommup53osq7s7f0k6bp6.apps.googleusercontent.com",
  clientSecret: "VwE91L-3_NWEcSlZfPJk6721",
  refreshToken:
    "1//0dbz-Pw36crhMCgYIPORTGB1SNwF-M2IrETpgP8ebvFCmFUuUXQRxxxIOuKiXE_ZvCLM7EbrHWah3dPOGOUfiBBuzwxjhplWISMB",
});
```

## API

### `uploadNew(stream, token?)`

Upload a new item to the Web Store. Use this only when you're uploading your
extension or theme for the very first time.

```typescript
import { readableStreamFromReader } from "https://deno.land/std@0.100.0/io/mod.ts";

const filePath = "/path/to/your/new/extension.zip";
const fileReader = await Deno.open(filePath, { read: true });
const fileStream = readableStreamFromReader(fileReader);
const uploadResult = await apiClient.uploadNew(fileStream);
console.log(uploadResult);

// {
//   "kind": "chromewebstore#item",
//   "id": "...",
//   "uploadState": "SUCCESS"
// }
```

### `uploadExisting(stream, token?)`

Upload a new version of an existing item to the Web Store. Use this when you're
uploading a newer version of an existing extension or theme.

```typescript
import { readableStreamFromReader } from "https://deno.land/std@0.100.0/io/mod.ts";

const filePath = "/path/to/your/existing/extension.zip";
const fileReader = await Deno.open(filePath, { read: true });
const fileStream = readableStreamFromReader(fileReader);
const uploadResult = await apiClient.uploadExisting(fileStream);
console.log(uploadResult);

// {
//   "kind": "chromewebstore#item",
//   "id": "...",
//   "uploadState": "SUCCESS"
// }
```

### `publish(target, token?)`

Publish the latest uploaded version of an existing item to the Web Store. By
default, this publishes to everyone.

```typescript
const publishResult = await apiClient.publish();
console.log(publishResult);

// {
//   "kind": "chromewebstore#item",
//   "item_id": "...",
//   "status": ["OK"],
//   "statusDetail": ["..."]
// }
```

If you'd like to publish only to your trusted testers, you can set the first
argument to the `publish()` call.

```typescript
const publishResult = await apiClient.publish("trustedTesters");
console.log(publishResult);

// {
//   "kind": "chromewebstore#item",
//   "item_id": "...",
//   "status": ["OK"],
//   "statusDetail": ["..."]
// }
```

### `checkUploadStatus(token?)`

Find out the upload status of your item on the Chrome Store.

```typescript
const uploadStatus = await apiClient.checkUploadStatus();
console.log(uploadStatus);

// {
//   "kind": "chromewebstore#item",
//   "id": "...",
//   "uploadState": "FAILURE",
//   "itemError": [{
//     "error_code": "...",
//     "error_detail": "..."
//   }]
// }
```

### `fetchToken()`

Fetches an access token; you won't need it most of the time, but it is available
if you need it.

```typescript
const accessToken = await apiClient.fetchToken();
console.log(accessToken);

// "..."
```

## Developer Notes

1.Useful `deno` shorthand scripts and Git hooks are set up with
[velociraptor](https://velociraptor.run/docs/installation/). You can view a list
of the commands using –

    ```
    vr
    ```
2. To debug this module or to get detailed logs, set the environment variable
`DEBUG` to `cwa:*`. For example, if you're a *Nix user, use the command —

```bash
DEBUG=cwa:* vr run test
```
## License

The code in this project is released under the [MIT License](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fgetoslash%2Fchrome-webstore-api.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fgetoslash%2Fchrome-webstore-api?ref=badge_large)
