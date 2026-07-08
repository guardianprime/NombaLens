import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

const queueName = "recovery-jobs";

class NoopQueue {
  async add(): Promise<{ id: string }> {
    return { id: "noop" };
  }
}

let recoveryQueueInstance: Queue | NoopQueue;

try {
  const connection = redis;
  recoveryQueueInstance = new Queue(queueName, { connection });
} catch (error) {
  console.warn(
    "Recovery queue disabled:",
    error instanceof Error ? error.message : String(error),
  );
  recoveryQueueInstance = new NoopQueue();
}

export const recoveryQueue = recoveryQueueInstance;
export const recoveryQueueName = queueName;
export const recoveryQueueConnection = null;
