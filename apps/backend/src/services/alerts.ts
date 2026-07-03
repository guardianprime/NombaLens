import { db } from "../db/client.js";
import { checkoutSessions, conversionEvents } from "../db/schema.js";
import { eq, gt, inArray } from "drizzle-orm";

export interface MerchantAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical" | "info";
}

const alertTemplates = {
  abandonedSpike: {
    title: "Abandoned checkout spike",
    description: "Abandoned checkouts increased sharply in the last 24 hours.",
    severity: "warning",
  },
  lowRecoveryRate: {
    title: "Recovery rate below target",
    description: "Recovery rate is lower than expected for recent checkout activity.",
    severity: "warning",
  },
  highAbandonmentInCard: {
    title: "High card checkout drop-off",
    description: "Card payments are generating a disproportionate share of drop offs.",
    severity: "info",
  },
} as const;

export async function getMerchantAlerts(merchantId: string): Promise<MerchantAlert[]> {
  const sessions = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.merchantId, merchantId));

  const events = await db
    .select()
    .from(conversionEvents)
    .where(eq(conversionEvents.merchantId, merchantId));

  const total = sessions.length;
  const abandoned = sessions.filter((session: any) => session.status === "pending").length;
  const recovered = sessions.filter((session: any) => session.status === "recovered").length;

  const recentEvents = events as Array<{ paymentMethod?: string | null }>;
  const cardDropOff = recentEvents.filter((event) => event.paymentMethod === "card").length;

  const alerts: MerchantAlert[] = [];

  if (total > 0 && abandoned / total > 0.35) {
    alerts.push({
      id: "abandoned-spike",
      ...alertTemplates.abandonedSpike,
    });
  }

  if (total > 0 && recovered / total < 0.15) {
    alerts.push({
      id: "low-recovery-rate",
      ...alertTemplates.lowRecoveryRate,
    });
  }

  if (total > 0 && cardDropOff / Math.max(1, events.length) > 0.4) {
    alerts.push({
      id: "high-card-abandonment",
      ...alertTemplates.highAbandonmentInCard,
    });
  }

  return alerts;
}
