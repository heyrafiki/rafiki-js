import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = ["index.ts", "README.md", "examples/covered-care.ts"];
const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
const forbidden = [
  /\bconvex\b/i,
  /\bsupabase\b/i,
  /\bworkos\b/i,
  /\bpaystack\b/i,
  /\bdaily\b/i,
  /\bvercel\b/i,
  /\blocalhost\b/i,
  /\bstaging\b/i,
  /\b(?:TODO|FIXME)\b/,
  /\bworld[- ]class\b/i,
  /\bproduction[- ]ready\b/i,
  /\bnot an example\b/i,
  /\bthis is real\b/i,
];

for (const pattern of forbidden) assert.doesNotMatch(source, pattern);

console.log(`Public boundary passed: ${files.length} files.`);
