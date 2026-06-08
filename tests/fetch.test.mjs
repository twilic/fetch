import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TWILIC_CONTENT_TYPE,
  createTwilicFetch,
  parseTwilicResponse,
  twilicFetch,
  twilicFetchJson,
} from "../dist/index.js";
import {
  createEchoServer,
  createJsonCodec,
  createTrackingCodec,
} from "./helpers.mjs";

test("twilicFetch sets content-type when twilicBody is provided", async () => {
  const server = await createEchoServer();
  try {
    const response = await twilicFetch(`${server.baseUrl}/echo`, {
      method: "POST",
      twilicBody: { id: 1n, name: "alice" },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), TWILIC_CONTENT_TYPE);
  } finally {
    await server.close();
  }
});

test("twilicFetchJson round-trips through echo server", async () => {
  const server = await createEchoServer();
  try {
    const payload = { id: 42n, active: true, tags: ["a", "b"] };
    const decoded = await twilicFetchJson(`${server.baseUrl}/echo`, {
      method: "POST",
      twilicBody: payload,
    });
    assert.equal(decoded.id, 42n);
    assert.equal(decoded.active, true);
    assert.deepEqual(decoded.tags, ["a", "b"]);
  } finally {
    await server.close();
  }
});

test("parseTwilicResponse rejects non-twilic content-type by default", async () => {
  const server = await createEchoServer();
  try {
    const response = await fetch(`${server.baseUrl}/json`);
    await assert.rejects(
      () => parseTwilicResponse(response),
      /Unsupported Media Type/,
    );
  } finally {
    await server.close();
  }
});

test("parseTwilicResponse allow non-twilic when requireContentType is false", async () => {
  const codec = createJsonCodec();
  const twilic = createTwilicFetch(codec);
  const server = await createEchoServer();
  try {
    const response = await fetch(`${server.baseUrl}/json`);
    const decoded = await twilic.parseResponse(response, {
      requireContentType: false,
    });
    assert.deepEqual(decoded, { ok: true });
  } finally {
    await server.close();
  }
});

test("createTwilicFetch uses injected codec", async () => {
  const codec = createTrackingCodec();
  const twilic = createTwilicFetch(codec);
  const server = await createEchoServer();
  try {
    await twilic.fetchJson(`${server.baseUrl}/echo`, {
      method: "POST",
      twilicBody: { tracked: true },
    });
    assert.equal(codec.stats.encodeCalls, 1);
    assert.equal(codec.stats.decodeCalls, 1);
  } finally {
    await server.close();
  }
});
