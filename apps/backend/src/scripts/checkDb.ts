import "dotenv/config";

import { db } from "../db/schema.js";

async function main(): Promise<void> {
  try {
    await (db as any).execute("SELECT 1 AS value");
    console.log("✓ Database connected successfully");
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ Database connection failed: ${message}`);
    process.exit(1);
  }
}

void main();
