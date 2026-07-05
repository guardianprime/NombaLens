import { cache } from "react";

const getHealth = cache(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const response = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | { status?: string; services?: Record<string, string> }
      | null;

    return { ok: response.ok, payload, apiUrl };
  } catch {
    return { ok: false, payload: null, apiUrl };
  }
});

export default async function HealthPage() {
  const health = await getHealth();

  if (!health.ok || !health.payload) {
    return (
      <main>
        <h1>Dashboard health</h1>
        <p>Cannot reach backend at {health.apiUrl} — is the backend running?</p>
      </main>
    );
  }

  const services = health.payload.services ?? {};

  return (
    <main>
      <h1>Dashboard health</h1>
      <p>Status: {health.payload.status ?? "unknown"}</p>
      <ul>
        <li>Database: {services.database === "ok" ? "✓" : "✗"}</li>
        <li>Redis: {services.redis === "ok" ? "✓" : "✗"}</li>
        <li>Nomba: {services.nomba === "ok" ? "✓" : "✗"}</li>
      </ul>
    </main>
  );
}
