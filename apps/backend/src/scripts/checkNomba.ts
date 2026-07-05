import "dotenv/config";

async function main(): Promise<void> {
  const baseUrl = (process.env.NOMBA_BASE_URL ?? "").trim();
  const clientId = (process.env.NOMBA_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.NOMBA_CLIENT_SECRET ?? "").trim();

  if (!baseUrl || !clientId || !clientSecret) {
    console.error("✗ Nomba auth failed: missing NOMBA_BASE_URL, NOMBA_CLIENT_ID, or NOMBA_CLIENT_SECRET");
    process.exit(1);
    return;
  }

  const authUrl = new URL("auth/token", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { access_token?: string };

    if (response.ok && payload.access_token) {
      console.log("✓ Nomba auth successful — token received");
      process.exit(0);
      return;
    }

    const message = typeof payload === "object" && payload && "error" in payload ? String((payload as { error?: unknown }).error) : "unknown error";
    console.error(`✗ Nomba auth failed: ${response.status} ${message}`);
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ Nomba auth failed: ${message}`);
    process.exit(1);
  }
}

void main();
