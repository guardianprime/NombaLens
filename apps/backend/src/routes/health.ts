import type { Request, Response } from "express";
import { redis } from "../lib/redis.js";
import { db } from "../db/client.js";

async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    await (db as any).execute("SELECT 1 AS value");
    return "ok";
  } catch {
    return "error";
  }
}

async function checkRedis(): Promise<"ok" | "error"> {
  const client = redis;

  try {
    const result = await client.ping();
    return result === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  } finally {
    client.disconnect();
  }
}

async function checkNomba(): Promise<"ok" | "error"> {
  const baseUrl = (process.env.NOMBA_BASE_URL ?? "").trim();
  const clientId = (process.env.NOMBA_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.NOMBA_CLIENT_SECRET ?? "").trim();

  if (!baseUrl || !clientId || !clientSecret) {
    return "error";
  }

  try {
    const authUrl = new URL(
      "auth/token",
      baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    );
    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      access_token?: string;
    };
    return response.ok && Boolean(payload.access_token) ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function healthHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const [database, redis, nomba] = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkNomba(),
  ]);

  const services = {
    database: database.status === "fulfilled" ? database.value : "error",
    redis: redis.status === "fulfilled" ? redis.value : "error",
    nomba: nomba.status === "fulfilled" ? nomba.value : "error",
  };

  const allDown = Object.values(services).every((value) => value === "error");
  const statusCode = allDown ? 503 : 200;

  res.status(statusCode).json({
    status: allDown ? "error" : "ok",
    timestamp: new Date().toISOString(),
    services,
  });
}
