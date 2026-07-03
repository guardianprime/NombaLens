import { Queue } from "bullmq";
import * as Redis from "ioredis";

const RedisClient = (Redis as unknown as { default: new (url?: string) => unknown }).default;
const connection = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379") as any;
const queueName = "recovery-jobs";

export const recoveryQueue = new Queue(queueName, { connection });
export const recoveryQueueName = queueName;
export const recoveryQueueConnection = connection;
