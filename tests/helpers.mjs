import http from "node:http";
import { decode, encode } from "@twilic/core";
import { TWILIC_CONTENT_TYPE } from "../dist/index.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export { encoder, decoder, TWILIC_CONTENT_TYPE };

export function createJsonCodec() {
  return {
    encode(value) {
      return encoder.encode(JSON.stringify(value));
    },
    decode(bytes) {
      if (bytes.length === 0) {
        return null;
      }
      return JSON.parse(decoder.decode(bytes));
    },
  };
}

export function createTrackingCodec(inner = createJsonCodec()) {
  const stats = {
    encodeCalls: 0,
    decodeCalls: 0,
    lastEncoded: null,
    lastDecoded: null,
  };
  return {
    stats,
    encode(value) {
      stats.encodeCalls += 1;
      stats.lastEncoded = value;
      return inner.encode(value);
    },
    decode(bytes) {
      stats.decodeCalls += 1;
      stats.lastDecoded = bytes;
      return inner.decode(bytes);
    },
  };
}

export async function createEchoServer() {
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);

    if (req.url === "/echo" && req.method === "POST") {
      res.setHeader("Content-Type", TWILIC_CONTENT_TYPE);
      res.end(body);
      return;
    }

    if (req.url === "/json" && req.method === "GET") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.statusCode = 404;
    res.end("not found");
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

export async function echoTwilic(baseUrl, payload) {
  const response = await fetch(`${baseUrl}/echo`, {
    method: "POST",
    headers: { "content-type": TWILIC_CONTENT_TYPE },
    body: encode(payload),
  });
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    decoded: decode(new Uint8Array(await response.arrayBuffer())),
  };
}
