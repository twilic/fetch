import { decode, encode, type TwilicValue } from "@twilic/core";

export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";

export interface TwilicCodec {
  encode: (value: TwilicValue) => Uint8Array;
  decode: (bytes: Uint8Array) => TwilicValue;
}

export interface TwilicFetchInit extends RequestInit {
  twilicBody?: TwilicValue;
}

export interface ParseTwilicResponseOptions {
  requireContentType?: boolean;
}

export interface TwilicFetch {
  fetch: (
    input: RequestInfo | URL,
    init?: TwilicFetchInit,
  ) => Promise<Response>;
  parseResponse: <T = TwilicValue>(
    response: Response,
    options?: ParseTwilicResponseOptions,
  ) => Promise<T>;
  fetchJson: <T = TwilicValue>(
    input: RequestInfo | URL,
    init?: TwilicFetchInit,
  ) => Promise<T>;
}

function hasTwilicContentType(contentType: string | null): boolean {
  return contentType?.startsWith(TWILIC_CONTENT_TYPE) ?? false;
}

function normalizeHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers);
}

function fetchWithCodec(
  codec: TwilicCodec,
  fetchImpl: typeof fetch,
  input: RequestInfo | URL,
  init?: TwilicFetchInit,
): Promise<Response> {
  const { twilicBody, ...fetchInit } = init ?? {};
  const headers = normalizeHeaders(fetchInit.headers);
  let body = fetchInit.body;

  if (twilicBody !== undefined) {
    body = Buffer.from(codec.encode(twilicBody));
    headers.set("Content-Type", TWILIC_CONTENT_TYPE);
  }

  return fetchImpl(input, {
    ...fetchInit,
    headers,
    body,
  });
}

async function parseResponseWithCodec<T>(
  codec: TwilicCodec,
  response: Response,
  options?: ParseTwilicResponseOptions,
): Promise<T> {
  const requireContentType = options?.requireContentType ?? true;
  const contentType = response.headers.get("content-type");

  if (requireContentType && !hasTwilicContentType(contentType)) {
    throw new Error("Unsupported Media Type");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return codec.decode(bytes) as T;
}

const defaultCodec: TwilicCodec = {
  encode,
  decode,
};

export function createTwilicFetch(
  codec: TwilicCodec = defaultCodec,
  fetchImpl: typeof fetch = fetch,
): TwilicFetch {
  return {
    fetch: (input, init) => fetchWithCodec(codec, fetchImpl, input, init),
    parseResponse: (response, options) =>
      parseResponseWithCodec(codec, response, options),
    fetchJson: async (input, init) => {
      const response = await fetchWithCodec(codec, fetchImpl, input, init);
      return parseResponseWithCodec(codec, response);
    },
  };
}

export function twilicFetch(
  input: RequestInfo | URL,
  init?: TwilicFetchInit,
): Promise<Response> {
  return fetchWithCodec(defaultCodec, fetch, input, init);
}

export function parseTwilicResponse<T = TwilicValue>(
  response: Response,
  options?: ParseTwilicResponseOptions,
): Promise<T> {
  return parseResponseWithCodec<T>(defaultCodec, response, options);
}

export function twilicFetchJson<T = TwilicValue>(
  input: RequestInfo | URL,
  init?: TwilicFetchInit,
): Promise<T> {
  return createTwilicFetch().fetchJson<T>(input, init);
}
