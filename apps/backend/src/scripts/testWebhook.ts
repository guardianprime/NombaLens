import "dotenv/config";

import { db } from "../db/schema.js";

const baseUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

async function postEvent(eventName: string, payload: unknown): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}/webhooks/nomba`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, data: payload }),
  });

  const body = await response.text();
  let parsedBody: unknown = body;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    // keep raw text
  }

  console.log(`Event ${eventName} -> ${response.status}`);
  console.log(JSON.stringify(parsedBody, null, 2));
  return { status: response.status, body: parsedBody };
}

async function getSessionStatus(orderId: string): Promise<string | null> {
  const [session] = await (db as any).select().from((await import("../db/schema.js")).checkoutSessions).where((await import("drizzle-orm")).eq((await import("../db/schema.js")).checkoutSessions.nombaOrderId, orderId)).limit(1);
  return session?.status ?? null;
}

async function main(): Promise<void> {
  const orderId = "test-order-smoke-001";
  await postEvent("checkout_created", {
    orderId,
    merchantId: "test-merchant-001",
    customerEmail: "test@example.com",
    amount: 5000,
    currency: "NGN",
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await postEvent("payment_success", {
    orderId,
    merchantId: "test-merchant-001",
    amount: 5000,
    currency: "NGN",
    paymentMethod: "bankTransfer",
  });

  const status = await getSessionStatus(orderId);
  console.log(`Final session status: ${status}`);

  if (status === "completed") {
    console.log("✓ Webhook flow verified");
    process.exit(0);
    return;
  }

  console.error(`✗ Unexpected session status: ${status}`);
  process.exit(1);
}

void main();
