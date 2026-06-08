import { test } from "node:test";
import assert from "node:assert/strict";
import { encode } from "@twilic/core";
import { TWILIC_CONTENT_TYPE, twilicFetchJson } from "../dist/index.js";
import { createEchoServer } from "./helpers.mjs";

test("twilicFetchJson round-trip with @twilic/core wire bytes", async () => {
  const server = await createEchoServer();
  try {
    const payload = {
      id: 42n,
      name: "alice",
      active: true,
      tags: ["a", "b"],
    };

    const decoded = await twilicFetchJson(`${server.baseUrl}/echo`, {
      method: "POST",
      twilicBody: payload,
    });

    assert.equal(decoded.id, 42n);
    assert.equal(decoded.name, "alice");
    assert.equal(decoded.active, true);
    assert.deepEqual(decoded.tags, ["a", "b"]);
  } finally {
    await server.close();
  }
});

test("twilicFetch sends encoded bytes with Twilic content-type", async () => {
  const server = await createEchoServer();
  try {
    const payload = { ok: true, value: 7n };
    const response = await fetch(`${server.baseUrl}/echo`, {
      method: "POST",
      headers: { "content-type": TWILIC_CONTENT_TYPE },
      body: encode(payload),
    });
    assert.equal(response.status, 200);

    const { twilicFetch } = await import("../dist/index.js");
    const echoed = await twilicFetch(`${server.baseUrl}/echo`, {
      method: "POST",
      twilicBody: payload,
    });
    assert.equal(echoed.headers.get("content-type"), TWILIC_CONTENT_TYPE);
  } finally {
    await server.close();
  }
});
