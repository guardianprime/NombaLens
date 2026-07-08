import "dotenv/config";
import { redis } from "../lib/redis.js";

import * as Redis from "ioredis";

async function main(): Promise<void> {
  const client = redis;

  try {
    const result = await client.ping();

    if (result === "PONG") {
      console.log("✓ Redis connected successfully");
      process.exit(0);
      return;
    }

    throw new Error(`Unexpected ping response: ${result}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ Redis connection failed: ${message}`);
    process.exit(1);
  } finally {
    client.disconnect();
  }
}

void main();
