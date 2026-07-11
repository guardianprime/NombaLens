import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export { db } from "./client.js";

export const checkoutSessionStatusEnum = pgEnum("checkout_session_status", [
  "pending",
  "completed",
  "recovered",
]);

export const recoveryJobStatusEnum = pgEnum("recovery_job_status", [
  "pending",
  "sent",
  "failed",
]);

export const conversionEventTypeEnum = pgEnum("conversion_event_type", [
  "created",
  "completed",
  "recovered",
]);

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombaClientId: varchar("nomba_client_id", { length: 255 }).notNull(),
  nombaSecret: varchar("nomba_secret", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const checkoutSessions = pgTable("checkout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id, { onDelete: "cascade" })
    .notNull(),
  nombaOrderId: varchar("nomba_order_id", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN").notNull(),
  status: checkoutSessionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const recoveryJobs = pgTable("recovery_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => checkoutSessions.id, { onDelete: "cascade" })
    .notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: recoveryJobStatusEnum("status").default("pending").notNull(),
});

export const conversionEvents = pgTable("conversion_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id, { onDelete: "cascade" })
    .notNull(),
  sessionId: uuid("session_id").references(() => checkoutSessions.id, {
    onDelete: "set null",
  }),
  paymentMethod: varchar("payment_method", { length: 64 }),
  eventType: conversionEventTypeEnum("event_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const splitConfigs = pgTable("split_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id, { onDelete: "cascade" })
    .notNull(),
  subAccountId: varchar("sub_account_id", { length: 255 }).notNull(),
  percentage: integer("percentage").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
