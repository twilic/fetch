# @twilic/fetch

Fetch helpers for Twilic binary request and response bodies.

## Install

```bash
pnpm add @twilic/fetch @twilic/core
```

## Usage

```ts
import { twilicFetchJson } from "@twilic/fetch";

const data = await twilicFetchJson("/api/users", {
  method: "POST",
  twilicBody: { id: 1n, name: "alice" },
});
```

In the browser, call `init({ prefer: "wasm" })` from `@twilic/core` before using these helpers.

## API

- `TWILIC_CONTENT_TYPE`
- `twilicFetch(input, init?)`
- `parseTwilicResponse(response, options?)`
- `twilicFetchJson(input, init?)`
- `createTwilicFetch(codec?, fetchImpl?)`

## Changelog

See [docs/CHANGELOG.md](docs/CHANGELOG.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
