# Heyrafiki CLI

Command-line access to the Heyrafiki API.

> Beta. Use with Sandbox projects.

## Run

```bash
npx @heyrafiki/cli@beta doctor
```

Set `HEYRAFIKI_API_KEY`, then make a read request:

```bash
npx @heyrafiki/cli@beta get /practitioners?limit=5
```

The Beta CLI supports read requests. For write operations, use the JavaScript SDK or REST API.

## License

Licensed under the [Apache License 2.0](./LICENSE).
