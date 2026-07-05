import { db } from "../db/client.js";
import { conversionEvents, checkoutSessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface AnalyticsSummary {
  totalOrders: number;
  completed: number;
  recovered: number;
  dropOffByPaymentMethod: Array<{ paymentMethod: string; count: number }>;
  revenueRecovered: number;
}

export interface TimeseriesData {
  dates: string[];
  orders: number[];
  completions: number[];
  recoveries: number[];
}

function buildDateLabels(range: "7d" | "30d"): string[] {
  const days = range === "7d" ? 7 : 30;
  const labels: string[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);

    labels.push(
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );
  }

  return labels;
}

export async function getAnalyticsSummary(merchantId: string): Promise<AnalyticsSummary> {
  const sessions = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.merchantId, merchantId));

  const completed = sessions.filter((session: any) => session.status === "completed").length;
  const recovered = sessions.filter((session: any) => session.status === "recovered").length;
  const revenueRecovered = sessions
    .filter((session: any) => session.status === "recovered")
    .reduce((sum: number, session: any) => sum + (session.amount ?? 0), 0);

  const events = await db
    .select()
    .from(conversionEvents)
    .where(eq(conversionEvents.merchantId, merchantId));

  const paymentMethodCounts = new Map<string, number>();
  for (const event of events as Array<{ paymentMethod?: string | null }>) {
    const paymentMethod = event.paymentMethod?.trim();
    if (!paymentMethod) {
      continue;
    }

    paymentMethodCounts.set(paymentMethod, (paymentMethodCounts.get(paymentMethod) ?? 0) + 1);
  }

  const dropOffByPaymentMethod: Array<{ paymentMethod: string; count: number }> = [];
  for (const [paymentMethod, count] of paymentMethodCounts.entries()) {
    dropOffByPaymentMethod.push({ paymentMethod, count });
  }

  return {
    totalOrders: sessions.length,
    completed,
    recovered,
    dropOffByPaymentMethod,
    revenueRecovered,
  };
}

export async function getAnalyticsTimeseries(
  merchantId: string,
  range: "7d" | "30d",
): Promise<TimeseriesData> {
  const sessions = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.merchantId, merchantId));

  const dates = buildDateLabels(range);
  const counts = dates.map(() => ({ orders: 0, completions: 0, recoveries: 0 }));

  for (const session of sessions as Array<{ status?: string; createdAt?: string | Date }>) {
    const created = new Date(session.createdAt ?? "");
    if (Number.isNaN(created.getTime())) {
      continue;
    }

    const label = created.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const index = dates.indexOf(label);
    if (index === -1) {
      continue;
    }

    const currentCount = counts[index];
    if (!currentCount) {
      continue;
    }

    currentCount.orders += 1;
    if (session.status === "completed" || session.status === "recovered") {
      currentCount.completions += 1;
    }
    if (session.status === "recovered") {
      currentCount.recoveries += 1;
    }
  }

  return {
    dates,
    orders: counts.map((entry) => entry.orders),
    completions: counts.map((entry) => entry.completions),
    recoveries: counts.map((entry) => entry.recoveries),
  };
}
