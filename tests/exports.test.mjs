import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TWILIC_CONTENT_TYPE,
  createTwilicFetch,
  parseTwilicResponse,
  twilicFetch,
  twilicFetchJson,
} from "../dist/index.js";

test("TWILIC_CONTENT_TYPE is application/vnd.twilic", () => {
  assert.equal(TWILIC_CONTENT_TYPE, "application/vnd.twilic");
});

test("named exports are functions", () => {
  assert.equal(typeof createTwilicFetch, "function");
  assert.equal(typeof twilicFetch, "function");
  assert.equal(typeof parseTwilicResponse, "function");
  assert.equal(typeof twilicFetchJson, "function");
});

test("createTwilicFetch returns fetch, parseResponse, and fetchJson", () => {
  const twilic = createTwilicFetch();
  assert.equal(typeof twilic.fetch, "function");
  assert.equal(typeof twilic.parseResponse, "function");
  assert.equal(typeof twilic.fetchJson, "function");
});
