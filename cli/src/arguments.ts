export type CliCommand =
  | { name: "help" }
  | { name: "version" }
  | { name: "doctor" }
  | { name: "get"; path: string };

export function parseArguments(input: string[]): CliCommand {
  const [command, ...rest] = input;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    return { name: "help" };
  }
  if (command === "version" || command === "--version" || command === "-v") {
    return { name: "version" };
  }
  if (command === "doctor") return { name: "doctor" };
  if (command === "get") {
    const [path, ...unexpected] = rest;
    if (!path || unexpected.length > 0) {
      throw new Error("Usage: heyrafiki get /resource");
    }
    if (!path.startsWith("/") || path.startsWith("//")) {
      throw new Error("Resource paths must start with one slash.");
    }
    return { name: "get", path };
  }

  throw new Error(`Unknown command: ${command}`);
}

export function resolveApiUrl(baseUrl: string, path: string): URL {
  const base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  const resolved = new URL(path.replace(/^\//, ""), base);
  if (resolved.origin !== base.origin) {
    throw new Error("Resource paths must stay on the configured API origin.");
  }
  return resolved;
}
