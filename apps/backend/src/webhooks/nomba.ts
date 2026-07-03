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
      order_id?: string;
      customer_email?: string;
      amount?: number;
      currency?: string;
      payment_method?: string;
    };
  };

  const eventName = event.event;
  const payload = event.data ?? {};

  if (eventName === "checkout_created") {
    const checkoutInput: {
      merchantId: string;
      nombaOrderId: string;
      customerEmail?: string | null;
      amount: number;
      currency?: string;
    } = {
      merchantId: payload.merchant_id ?? "",
      nombaOrderId: payload.order_id ?? "",
      amount: payload.amount ?? 0,
    };

    if (payload.customer_email) {
      checkoutInput.customerEmail = payload.customer_email;
    }

    if (payload.currency) {
      checkoutInput.currency = payload.currency;
    }

    const session = await createCheckoutSession(checkoutInput);
    await createConversionEvent({
      merchantId: session.merchantId,
      sessionId: session.id,
      paymentMethod: payload.payment_method ?? null,
      eventType: "created",
    });

    if (session.customerEmail) {
      const scheduledAt = new Date(Date.now() + 1000 * 60 * 15);
      await enqueueRecoveryJob(session.id, session.nombaOrderId, scheduledAt);
    }

    res.status(202).json({ success: true });
    return;
  }

  if (eventName === "payment_success") {
    const orderId = payload.order_id;
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
          paymentMethod: payload.payment_method ?? null,
          eventType: isRecovered ? "recovered" : "completed",
        });
      }
    }

    res.status(202).json({ success: true });
    return;
  }

  if (eventName === "payment_failed") {
    const pendingSession = payload.order_id ? await getPendingSessionByOrderId(payload.order_id) : null;
    if (pendingSession && pendingSession.customerEmail && !(await hasRecoveryJobForSession(pendingSession.id))) {
      const scheduledAt = new Date(Date.now() + 1000 * 60 * 15);
      await enqueueRecoveryJob(pendingSession.id, pendingSession.nombaOrderId, scheduledAt);
    }
    res.status(202).json({ success: true, pendingSession });
    return;
  }

  res.status(202).json({ success: true, ignored: true });
}
