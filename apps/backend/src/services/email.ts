import { Resend } from "resend";

export interface EmailServiceConfig {
  apiKey: string;
}

export class EmailService {
  private readonly resend: Resend;

  constructor(config: EmailServiceConfig) {
    this.resend = new Resend(config.apiKey);
  }

  public async sendRecoveryEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    const response = await this.resend.emails.send({
      from: "NombaLens <hello@nombalens.com>",
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }
  }
}
