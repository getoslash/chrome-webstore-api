import {
  assertEquals,
  assertThrowsAsync,
  resolvesNext,
  stub,
} from "../dev_deps.ts";
import {
  fixtures,
  getClient,
  getDefaultExportClient,
  getToken,
} from "./helpers.ts";
import type { Stub } from "../dev_deps.ts";

Deno.test({
  name:
    "fetchToken() > should POST the payload and return the 'access_token' field.",
  fn: async () => {
    const client = getClient();
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "access_token": "xyz",
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    const accessToken = await client.fetchToken();
    assertEquals(
      fetchStub.calls[0].args[0],
      "https://www.googleapis.com/oauth2/v4/token",
    );
    assertEquals(fetchStub.calls[0].args[1].method, "POST");
    assertEquals(
      fetchStub.calls[0].args[1].body,
      JSON.stringify({
        client_id: fixtures.clientOptions.clientId,
        client_secret: fixtures.clientOptions.clientSecret,
        refresh_token: fixtures.clientOptions.refreshToken,
        grant_type: "refresh_token",
      }),
    );
    assertEquals(accessToken, "xyz");
    fetchStub.restore();
  },
});

Deno.test({
  name: "uploadNew() > should POST the payload.",
  fn: async () => {
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "ok": true,
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const client = getClient();
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    const stream = new ReadableStream();
    await client.uploadNew(stream, getToken());
    assertEquals(
      fetchStub.calls[0].args[0],
      `https://www.googleapis.com/upload/chromewebstore/v1.1/items`,
    );
    assertEquals(fetchStub.calls[0].args[1].method, "POST");
    assertEquals(fetchStub.calls[0].args[1].headers, {
      "Authorization": `Bearer ${fixtures.accessToken}`,
      "x-goog-api-version": "2",
    });
    fetchStub.restore();
  },
});

Deno.test({
  name: "uploadNew() > should throw when the input stream is missing.",
  fn: () => {
    const client = getClient();
    // @ts-expect-error We're specifically making this `null` to see if it will throw.
    const stream: ReadableStream = null;
    assertThrowsAsync(
      async () => {
        await client.uploadNew(stream, getToken());
      },
      Error,
      "Nothing to upload!",
    );
  },
});

Deno.test({
  name: "uploadExisting() > should PUT the payload.",
  fn: async () => {
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "ok": true,
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const client = getClient();
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    const stream = new ReadableStream();
    await client.uploadExisting(stream, getToken());
    assertEquals(
      fetchStub.calls[0].args[0],
      `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${fixtures.clientOptions.id}`,
    );
    assertEquals(fetchStub.calls[0].args[1].method, "PUT");
    assertEquals(fetchStub.calls[0].args[1].headers, {
      "Authorization": `Bearer ${fixtures.accessToken}`,
      "x-goog-api-version": "2",
    });
    fetchStub.restore();
  },
});

Deno.test({
  name: "uploadExisting() > should throw when the input stream is missing.",
  fn: () => {
    const client = getClient();
    // @ts-expect-error We're specifically making this `null` to see if it will throw.
    const stream: ReadableStream = null;
    assertThrowsAsync(
      async () => {
        await client.uploadExisting(stream, getToken());
      },
      Error,
      "Nothing to upload!",
    );
  },
});

Deno.test({
  name: "publish() > should POST and default to 'default' target.",
  fn: async () => {
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "ok": true,
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const client = getClient();
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    await client.publish(undefined, getToken());
    assertEquals(
      fetchStub.calls[0].args[0],
      `https://www.googleapis.com/chromewebstore/v1.1/items/${fixtures.clientOptions.id}/publish?publishTarget=default`,
    );
    assertEquals(fetchStub.calls[0].args[1].method, "POST");
    assertEquals(fetchStub.calls[0].args[1].headers, {
      "Authorization": `Bearer ${fixtures.accessToken}`,
      "x-goog-api-version": "2",
    });
    fetchStub.restore();
  },
});

Deno.test({
  name:
    "publish() > should POST with trusted testers as target if called with that target.",
  fn: async () => {
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "ok": true,
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const client = getClient();
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    await client.publish("trustedUsers", getToken());
    assertEquals(
      fetchStub.calls[0].args[0],
      `https://www.googleapis.com/chromewebstore/v1.1/items/${fixtures.clientOptions.id}/publish?publishTarget=trustedUsers`,
    );
    assertEquals(fetchStub.calls[0].args[1].method, "POST");
    assertEquals(fetchStub.calls[0].args[1].headers, {
      "Authorization": `Bearer ${fixtures.accessToken}`,
      "x-goog-api-version": "2",
    });
    fetchStub.restore();
  },
});

Deno.test({
  name: "checkUploadStatus() > should GET the payload.",
  fn: async () => {
    const mockResponses = [
      new Response(
        new Blob([
          JSON.stringify(
            {
              "ok": true,
            },
            null,
            2,
          ),
        ], { type: "application/json" }),
      ),
    ];
    const client = getClient();
    const fetchStub: Stub<typeof globalThis> = stub(
      globalThis,
      "fetch",
      resolvesNext(mockResponses),
    );
    await client.checkUploadStatus(getToken());
    assertEquals(
      fetchStub.calls[0].args[0],
      `https://www.googleapis.com/chromewebstore/v1.1/items/${fixtures.clientOptions.id}?projection=draft`,
    );
    assertEquals(fetchStub.calls[0].args[1].method, "GET");
    assertEquals(fetchStub.calls[0].args[1].headers, {
      "Authorization": `Bearer ${fixtures.accessToken}`,
      "x-goog-api-version": "2",
    });
    fetchStub.restore();
  },
});

Deno.test({
  name: "The module should by default export a constructor wrapper.",
  fn: () => {
    const client = getClient();
    const defaultClient = getDefaultExportClient(fixtures.clientOptions);
    assertEquals(defaultClient, client);
  },
});
