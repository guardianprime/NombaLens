import type { Request, Response } from "express";

import {
  createCheckoutSession,
  getPendingSessionByOrderId,
  markCheckoutCompleted,
  markCheckoutRecovered,
  createConversionEvent,
  enqueueRecoveryJob,
  getSessionByOrderId,
  hasRecoveryJobForSession,
} from "../services/recovery.js";

export async function handleNombaWebhook(req: Request, res: Response): Promise<void> {
  const event = req.body as {
    event?: string;
    data?: {
      merchant_id?: string;
      merchantId?: string;
      order_id?: string;
      orderId?: string;
      customer_email?: string;
      customerEmail?: string;
      amount?: number;
      currency?: string;
      payment_method?: string;
      paymentMethod?: string;
    };
  };

  const eventName = event.event;
  const payload = event.data ?? {};
  const merchantId = payload.merchant_id ?? payload.merchantId ?? "";
  const orderId = payload.order_id ?? payload.orderId ?? "";
  const customerEmail = payload.customer_email ?? payload.customerEmail;
  const paymentMethod = payload.payment_method ?? payload.paymentMethod;

  if (eventName === "checkout_created") {
    const checkoutInput: {
      merchantId: string;
      nombaOrderId: string;
      customerEmail?: string | null;
      amount: number;
      currency?: string;
    } = {
      merchantId,
      nombaOrderId: orderId,
      amount: payload.amount ?? 0,
    };

    if (customerEmail) {
      checkoutInput.customerEmail = customerEmail;
    }

    if (payload.currency) {
      checkoutInput.currency = payload.currency;
    }

    const session = await createCheckoutSession(checkoutInput);
    await createConversionEvent({
      merchantId: session.merchantId,
      sessionId: session.id,
      paymentMethod: paymentMethod ?? null,
      eventType: "created",
    });

    if (session.customerEmail) {
      const recoveryMinutes = Number(process.env.RECOVERY_TIMEOUT_MINUTES ?? 15);
      const scheduledAt = new Date(Date.now() + 1000 * 60 * recoveryMinutes);
      await enqueueRecoveryJob(session.id, session.nombaOrderId, scheduledAt);
    }

    res.status(202).json({ success: true });
    return;
  }

  if (eventName === "payment_success") {
    if (orderId) {
      const session = await getSessionByOrderId(orderId);
      if (session) {
        const isRecovered = await hasRecoveryJobForSession(session.id);
        if (isRecovered) {
          await markCheckoutRecovered(orderId);
        } else {
          await markCheckoutCompleted(orderId);
        }

        await createConversionEvent({
          merchantId: session.merchantId,
          sessionId: session.id,
          paymentMethod: paymentMethod ?? null,
          eventType: isRecovered ? "recovered" : "completed",
        });
      }
    }

    res.status(202).json({ success: true });
    return;
  }

  if (eventName === "payment_failed") {
    const pendingSession = orderId ? await getPendingSessionByOrderId(orderId) : null;
    if (pendingSession && pendingSession.customerEmail && !(await hasRecoveryJobForSession(pendingSession.id))) {
      const recoveryMinutes = Number(process.env.RECOVERY_TIMEOUT_MINUTES ?? 15);
      const scheduledAt = new Date(Date.now() + 1000 * 60 * recoveryMinutes);
      await enqueueRecoveryJob(pendingSession.id, pendingSession.nombaOrderId, scheduledAt);
    }
    res.status(202).json({ success: true, pendingSession });
    return;
  }

  res.status(202).json({ success: true, ignored: true });
}
