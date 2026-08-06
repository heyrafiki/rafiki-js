#!/usr/bin/env node

import { parseArguments, resolveApiUrl } from "./arguments.js";

const VERSION = "0.1.0-beta.1";
const DEFAULT_API_BASE_URL = "https://api.heyrafiki.space/v1";

function printHelp() {
  console.log(`Heyrafiki CLI ${VERSION}

Usage:
  heyrafiki doctor
  heyrafiki get /practitioners?limit=5
  heyrafiki version

Environment:
  HEYRAFIKI_API_KEY       Sandbox or production API key
  HEYRAFIKI_API_BASE_URL  API base URL (defaults to ${DEFAULT_API_BASE_URL})`);
}

function runDoctor(environment: NodeJS.ProcessEnv): number {
  const major = Number(process.versions.node.split(".")[0]);
  const checks = [
    { name: "Node.js 22 or newer", ok: major >= 22 },
    { name: "HEYRAFIKI_API_KEY", ok: Boolean(environment.HEYRAFIKI_API_KEY?.trim()) },
  ];

  for (const check of checks) {
    console.log(`${check.ok ? "ok" : "missing"}  ${check.name}`);
  }
  return checks.every((check) => check.ok) ? 0 : 1;
}

async function getResource(path: string, environment: NodeJS.ProcessEnv) {
  const apiKey = environment.HEYRAFIKI_API_KEY?.trim();
  if (!apiKey) throw new Error("HEYRAFIKI_API_KEY is required.");

  const url = resolveApiUrl(
    environment.HEYRAFIKI_API_BASE_URL ?? DEFAULT_API_BASE_URL,
    path,
  );
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    },
  });
  const body = await response.text();
  const requestId = response.headers.get("x-request-id");

  if (!response.ok) {
    if (requestId) console.error(`Request ID: ${requestId}`);
    throw new Error(`Heyrafiki API returned ${response.status}.`);
  }

  try {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  } catch {
    console.log(body);
  }
}

async function main() {
  const command = parseArguments(process.argv.slice(2));
  if (command.name === "help") return printHelp();
  if (command.name === "version") return console.log(VERSION);
  if (command.name === "doctor") {
    process.exitCode = runDoctor(process.env);
    return;
  }
  await getResource(command.path, process.env);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The command failed.");
  process.exitCode = 1;
});
