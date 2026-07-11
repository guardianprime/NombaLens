CREATE TYPE "checkout_session_status" AS ENUM('pending', 'completed', 'recovered');--> statement-breakpoint
CREATE TYPE "conversion_event_type" AS ENUM('created', 'completed', 'recovered');--> statement-breakpoint
CREATE TYPE "recovery_job_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_id" uuid NOT NULL,
	"nomba_order_id" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'NGN' NOT NULL,
	"status" "checkout_session_status" DEFAULT 'pending'::"checkout_session_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "conversion_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_id" uuid NOT NULL,
	"session_id" uuid,
	"payment_method" varchar(64),
	"event_type" "conversion_event_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nomba_client_id" varchar(255) NOT NULL,
	"nomba_secret" varchar(255) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"session_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"status" "recovery_job_status" DEFAULT 'pending'::"recovery_job_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "split_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_id" uuid NOT NULL,
	"sub_account_id" varchar(255) NOT NULL,
	"percentage" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversion_events" ADD CONSTRAINT "conversion_events_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversion_events" ADD CONSTRAINT "conversion_events_session_id_checkout_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "checkout_sessions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "recovery_jobs" ADD CONSTRAINT "recovery_jobs_session_id_checkout_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "checkout_sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "split_configs" ADD CONSTRAINT "split_configs_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;