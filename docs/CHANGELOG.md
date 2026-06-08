# Changelog

## [Unreleased]

## [0.1.1] - 2026-06-08

Initial public release of `@twilic/fetch`. Version 0.1.0 was published locally without npm trusted publishing and is not part of the canonical release line.

### Added

- `TWILIC_CONTENT_TYPE` constant.
- `twilicFetch(input, init?)` with `twilicBody` request encoding.
- `parseTwilicResponse(response, options?)` response decoding.
- `twilicFetchJson(input, init?)` convenience helper.
- `createTwilicFetch(codec?, fetchImpl?)` factory for injectable encode/decode.
- Node integration tests with an echo HTTP server.
