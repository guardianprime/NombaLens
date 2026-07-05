import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendKeys = [
  "NOMBA_CLIENT_ID",
  "NOMBA_CLIENT_SECRET",
  "NOMBA_BASE_URL",
  "DATABASE_URL",
  "REDIS_URL",
  "RESEND_API_KEY",
  "JWT_SECRET",
  "RECOVERY_TIMEOUT_MINUTES",
  "PORT",
] as const;

const dashboardKeys = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_MERCHANT_ID"] as const;

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((accumulator, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      accumulator[key] = value;
      return accumulator;
    }, {});
}

function resolveEnvPath(fileName: string): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(currentDir, `../../../../${fileName}`),
    path.resolve(currentDir, `../../${fileName}`),
    path.resolve(currentDir, `../../../${fileName}`),
    path.resolve(currentDir, `../${fileName}`),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0] ?? "";
}

const green = "\u001b[32m";
const red = "\u001b[31m";
const reset = "\u001b[0m";

function maskValue(value: string): string {
  if (!value) {
    return "";
  }

  if (value.length <= 4) {
    return value;
  }

  return `${value.slice(0, 4)}...`;
}

function getValue(key: string, envObject: Record<string, string>): string | undefined {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  return envObject[key]?.trim();
}

function main(): void {
  const backendEnvPath = resolveEnvPath("apps/backend/.env");
  const dashboardEnvPath = resolveEnvPath("apps/dashboard/.env.local");
  const backendEnv = readEnvFile(backendEnvPath);
  const dashboardEnv = readEnvFile(dashboardEnvPath);
  const missing: string[] = [];

  for (const key of backendKeys) {
    const value = getValue(key, backendEnv);

    if (value) {
      console.log(`${green}✓${reset} ${key}=${maskValue(value)}`);
      continue;
    }

    missing.push(key);
    console.error(`${red}✗ MISSING:${reset} ${key}`);
  }

  for (const key of dashboardKeys) {
    const value = getValue(key, dashboardEnv);

    if (value) {
      console.log(`${green}✓${reset} ${key}=${maskValue(value)}`);
      continue;
    }

    missing.push(key);
    console.error(`${red}✗ MISSING:${reset} ${key}`);
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main();
