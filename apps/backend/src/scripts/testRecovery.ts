import "dotenv/config";

import { db } from "../db/schema.js";

const baseUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const orderId = "test-order-recovery-001";

async function postEvent(eventName: string, payload: unknown): Promise<void> {
  await fetch(`${baseUrl}/webhooks/nomba`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, data: payload }),
  });
}

async function getSessionStatus(): Promise<string | null> {
  const [session] = await (db as any).select().from((await import("../db/schema.js")).checkoutSessions).where((await import("drizzle-orm")).eq((await import("../db/schema.js")).checkoutSessions.nombaOrderId, orderId)).limit(1);
  return session?.status ?? null;
}

async function getRecoveryJob(): Promise<{ sentAt: string | null } | null> {
  const [session] = await (db as any).select().from((await import("../db/schema.js")).checkoutSessions).where((await import("drizzle-orm")).eq((await import("../db/schema.js")).checkoutSessions.nombaOrderId, orderId)).limit(1);
  if (!session?.id) {
    return null;
  }

  const [job] = await (db as any).select().from((await import("../db/schema.js")).recoveryJobs).where((await import("drizzle-orm")).eq((await import("../db/schema.js")).recoveryJobs.sessionId, session.id)).limit(1);
  return job ?? null;
}

async function main(): Promise<void> {
  process.env.RECOVERY_TIMEOUT_MINUTES = "1";

  await postEvent("checkout_created", {
    orderId,
    merchantId: "test-merchant-002",
    customerEmail: "test@example.com",
    amount: 5000,
    currency: "NGN",
  });

  for (let remaining = 70; remaining > 0; remaining -= 1) {
    process.stdout.write(`Waiting ${remaining}s...\r`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  process.stdout.write("\n");

  const status = await getSessionStatus();
  const recoveryJob = await getRecoveryJob();

  if (status === "recovered" && recoveryJob?.sentAt) {
    console.log("✓ Recovery flow verified — email job fired");
    process.exit(0);
    return;
  }

  console.error("✗ Recovery job did not fire");
  process.exit(1);
}

void main();
