import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";
const client = postgres(connectionString, { max: 1 });

// Compatibility shim for the installed Drizzle version in this workspace.
const drizzleCompat = drizzle as any;

export const db: any = drizzleCompat({ client });
