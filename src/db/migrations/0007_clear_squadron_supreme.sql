CREATE TABLE IF NOT EXISTS "complaint_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text,
	"size_bytes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "problem_location" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "has_previous_complaint_elsewhere" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "previous_complaint_channel" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "impact_category" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "urgency_level" text;
--> statement-breakpoint
ALTER TABLE "complaints" ADD COLUMN "impact_scope" text;
--> statement-breakpoint
ALTER TABLE "complaints" ALTER COLUMN "is_public" SET DEFAULT true;
--> statement-breakpoint
ALTER TABLE "complaint_attachments" ADD CONSTRAINT "complaint_attachments_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;
