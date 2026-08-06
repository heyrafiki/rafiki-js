# Heyrafiki CLI

Command-line access to the Heyrafiki API.

> Beta: use a sandbox project while the command surface settles.

## Run

```bash
npx @heyrafiki/cli@beta doctor
```

Set `HEYRAFIKI_API_KEY`, then make a read request:

```bash
npx @heyrafiki/cli@beta get /practitioners?limit=5
```

The Beta CLI supports read requests only. Use the JavaScript SDK or REST API for writes so idempotency and approval rules stay explicit.

## License

Licensed under the [Apache License 2.0](./LICENSE).
