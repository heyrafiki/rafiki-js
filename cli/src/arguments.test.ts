import assert from "node:assert/strict";
import test from "node:test";
import { parseArguments, resolveApiUrl } from "./arguments.js";

test("parses the supported commands", () => {
  assert.deepEqual(parseArguments([]), { name: "help" });
  assert.deepEqual(parseArguments(["doctor"]), { name: "doctor" });
  assert.deepEqual(parseArguments(["get", "/practitioners?limit=5"]), {
    name: "get",
    path: "/practitioners?limit=5",
  });
});

test("rejects absolute and protocol-relative resource paths", () => {
  assert.throws(() => parseArguments(["get", "https://example.com"]));
  assert.throws(() => parseArguments(["get", "//example.com"]));
});

test("resolves paths against the configured API base", () => {
  assert.equal(
    resolveApiUrl("https://api.heyrafiki.space/v1", "/practitioners").href,
    "https://api.heyrafiki.space/v1/practitioners",
  );
});
