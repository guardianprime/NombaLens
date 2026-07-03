export interface NombaApiClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class NombaApiClient {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken?: string;

  constructor(config: NombaApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  public async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to obtain Nomba access token: ${response.status}`);
    }

    const payload = (await response.json()) as { access_token?: string };
    this.accessToken = payload.access_token ?? "";

    if (!this.accessToken) {
      throw new Error("Nomba access token was not returned.");
    }

    return this.accessToken;
  }

  public async getTransactions(customerEmail: string): Promise<Array<{ paymentMethod?: string | null }>> {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/transactions?customer_email=${encodeURIComponent(customerEmail)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Nomba transactions: ${response.status}`);
    }

    const payload = (await response.json()) as { data?: Array<{ paymentMethod?: string | null }> };
    return payload.data ?? [];
  }
}
