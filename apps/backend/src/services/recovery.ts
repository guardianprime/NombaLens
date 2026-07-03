import { db } from "../db/client.js";
import { checkoutSessions, recoveryJobs, conversionEvents } from "../db/schema.js";
import { recoveryQueue } from "../jobs/recoveryQueue.js";
import { eq, and } from "drizzle-orm";

export interface RecoveryEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface CheckoutSessionRecord {
  id: string;
  merchantId: string;
  nombaOrderId: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  status: string;
}

export type ConversionEventType = "created" | "completed" | "recovered";

export async function createCheckoutSession(input: {
  merchantId: string;
  nombaOrderId: string;
  customerEmail?: string | null;
  amount: number;
  currency?: string;
}): Promise<CheckoutSessionRecord> {
  const [session] = await db
    .insert(checkoutSessions)
    .values({
      merchantId: input.merchantId,
      nombaOrderId: input.nombaOrderId,
      customerEmail: input.customerEmail ?? null,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      status: "pending",
    })
    .returning();

  return session as CheckoutSessionRecord;
}

export async function markCheckoutCompleted(nombaOrderId: string): Promise<void> {
  await db
    .update(checkoutSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(checkoutSessions.nombaOrderId, nombaOrderId));
}

export async function markCheckoutRecovered(nombaOrderId: string): Promise<void> {
  await db
    .update(checkoutSessions)
    .set({ status: "recovered", completedAt: new Date() })
    .where(eq(checkoutSessions.nombaOrderId, nombaOrderId));
}

export async function createConversionEvent(input: {
  merchantId: string;
  sessionId?: string;
  paymentMethod?: string | null;
  eventType: ConversionEventType;
}): Promise<void> {
  await db.insert(conversionEvents).values({
    merchantId: input.merchantId,
    sessionId: input.sessionId ?? null,
    paymentMethod: input.paymentMethod ?? null,
    eventType: input.eventType,
  });
}

export async function enqueueRecoveryJob(sessionId: string, nombaOrderId: string, scheduledAt: Date): Promise<void> {
  const [jobRecord] = await db
    .insert(recoveryJobs)
    .values({
      sessionId,
      scheduledAt,
      status: "pending",
    })
    .returning();

  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  await recoveryQueue.add(
    "send_recovery_email",
    {
      sessionId,
      nombaOrderId,
      recoveryJobId: (jobRecord as { id: string }).id,
    },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

export async function getSessionByOrderId(nombaOrderId: string): Promise<CheckoutSessionRecord | null> {
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.nombaOrderId, nombaOrderId))
    .limit(1);

  return (session as CheckoutSessionRecord | undefined) ?? null;
}

export async function getPendingSessionByOrderId(nombaOrderId: string): Promise<CheckoutSessionRecord | null> {
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(and(eq(checkoutSessions.nombaOrderId, nombaOrderId), eq(checkoutSessions.status, "pending")))
    .limit(1);

  return (session as CheckoutSessionRecord | undefined) ?? null;
}

export async function hasRecoveryJobForSession(sessionId: string): Promise<boolean> {
  const [job] = await db
    .select()
    .from(recoveryJobs)
    .where(eq(recoveryJobs.sessionId, sessionId))
    .limit(1);

  return Boolean(job);
}

export async function markRecoveryJobSent(jobId: string): Promise<void> {
  await db
    .update(recoveryJobs)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(recoveryJobs.id, jobId));
}

export async function markRecoveryJobFailed(jobId: string): Promise<void> {
  await db
    .update(recoveryJobs)
    .set({ status: "failed", sentAt: new Date() })
    .where(eq(recoveryJobs.id, jobId));
}

export function buildRecoveryEmailPayload(customerEmail: string, nombaOrderId: string): RecoveryEmailPayload {
  const recoveryLink = `https://checkout.nomba.com/pay/${nombaOrderId}`;
  const subject = `Complete your checkout for order ${nombaOrderId}`;
  const html = `<p>Your checkout is still waiting for completion. You can resume it here: <a href="${recoveryLink}">${recoveryLink}</a></p>`;
  const text = `Your checkout is still waiting for completion. Resume it here: ${recoveryLink}`;

  return {
    to: customerEmail,
    subject,
    html,
    text,
  };
}
