# Changelog

## [Unreleased]

## [0.1.0] - 2026-06-08

Initial public release of `@twilic/fetch`.

### Added

- `TWILIC_CONTENT_TYPE` constant.
- `twilicFetch(input, init?)` with `twilicBody` request encoding.
- `parseTwilicResponse(response, options?)` response decoding.
- `twilicFetchJson(input, init?)` convenience helper.
- `createTwilicFetch(codec?, fetchImpl?)` factory for injectable encode/decode.
- Node integration tests with an echo HTTP server.
