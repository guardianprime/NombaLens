import { Queue } from "bullmq";
import * as Redis from "ioredis";

const RedisClient = (Redis as unknown as { default: new (url?: string) => unknown }).default;
const queueName = "recovery-jobs";

class NoopQueue {
  async add(): Promise<{ id: string }> {
    return { id: "noop" };
  }
}

let recoveryQueueInstance: Queue | NoopQueue;

try {
  const connection = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379") as any;
  recoveryQueueInstance = new Queue(queueName, { connection });
} catch (error) {
  console.warn("Recovery queue disabled:", error instanceof Error ? error.message : String(error));
  recoveryQueueInstance = new NoopQueue();
}

export const recoveryQueue = recoveryQueueInstance;
export const recoveryQueueName = queueName;
export const recoveryQueueConnection = null;
