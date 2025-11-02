CREATE TYPE "public"."report_status" AS ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('BUG', 'FEATURE_REQUEST', 'FEEDBACK', 'ABUSE', 'OTHER');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"type" "report_type" NOT NULL,
	"status" "report_status" DEFAULT 'PENDING' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"related_complaint_id" uuid,
	"related_company_id" uuid,
	"admin_notes" text,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_profiles_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_related_complaint_id_complaints_id_fk" FOREIGN KEY ("related_complaint_id") REFERENCES "public"."complaints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_related_company_id_companies_id_fk" FOREIGN KEY ("related_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_profiles_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;