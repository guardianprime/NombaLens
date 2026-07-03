import type { ConversionStats, RecoverySession, SplitConfig, TimeseriesData } from "../types/index";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function requireApiUrl(): string {
  if (!apiUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
  }
  return apiUrl;
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${requireApiUrl()}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return (await res.json()) as T;
}

export async function getConversionStats(merchantId: string): Promise<ConversionStats> {
  const result = await fetchJson<{ success: boolean; data: ConversionStats }>(`/api/analytics/${merchantId}`);
  return result.data;
}

export async function getTimeseries(merchantId: string, range: "7d" | "30d"): Promise<TimeseriesData> {
  const result = await fetchJson<{ success: boolean; data: TimeseriesData }>(`/api/analytics/${merchantId}/timeseries?range=${range}`);
  return result.data;
}

export async function getRecoverySessions(merchantId: string): Promise<{ sessions: RecoverySession[] }> {
  return fetchJson<{ sessions: RecoverySession[] }>(`/api/recovery/${merchantId}`);
}

export async function getSplitConfig(merchantId: string): Promise<{ configs: SplitConfig[] }> {
  return fetchJson<{ configs: SplitConfig[] }>(`/api/split/${merchantId}`);
}

export async function saveSplitConfig(
  merchantId: string,
  configs: Array<Pick<SplitConfig, "subAccountId" | "percentage">>,
): Promise<{ success: boolean }> {
  const url = `${requireApiUrl()}/api/split/${merchantId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ configs }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to save split config");
  }

  return (await res.json()) as { success: boolean };
}

export async function getAlerts(merchantId: string): Promise<{ alerts: Alert[] }> {
  return fetchJson<{ alerts: Alert[] }>(`/api/alerts/${merchantId}`);
}
