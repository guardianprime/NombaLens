import { Worker, Queue } from "bullmq";
import * as Redis from "ioredis";

import {
  buildRecoveryEmailPayload,
  getPendingSessionByOrderId,
  markRecoveryJobFailed,
  markRecoveryJobSent,
} from "../services/recovery.js";
import { EmailService } from "../services/email.js";

const RedisClient = (Redis as unknown as { default: new (url?: string) => unknown }).default;
const connection = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379") as any;
const queueName = "recovery-jobs";

export const recoveryQueue = new Queue(queueName, { connection });

export function startRecoveryWorker(): void {
  new Worker(
    queueName,
    async (job) => {
      const session = await getPendingSessionByOrderId(String(job.data?.nombaOrderId ?? ""));
      if (!session?.customerEmail) {
        return;
      }

      const emailService = new EmailService({ apiKey: process.env.RESEND_API_KEY ?? "" });
      const payload = buildRecoveryEmailPayload(session.customerEmail, session.nombaOrderId);

      try {
        await emailService.sendRecoveryEmail(payload.to, payload.subject, payload.html, payload.text);
        await markRecoveryJobSent(String(job.data?.recoveryJobId ?? job.id));
      } catch (error) {
        await markRecoveryJobFailed(String(job.data?.recoveryJobId ?? job.id));
        throw error;
      }
    },
    { connection },
  );
}
