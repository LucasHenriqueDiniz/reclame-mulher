CREATE TYPE "public"."how_heard_source_type" AS ENUM('PREDEFINED', 'FREE_TEXT');--> statement-breakpoint
CREATE TABLE "how_heard_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "how_heard_options_label_unique" UNIQUE("label"),
	CONSTRAINT "how_heard_options_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_how_heard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_type" "how_heard_source_type" DEFAULT 'FREE_TEXT' NOT NULL,
	"option_id" uuid,
	"free_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_how_heard" ADD CONSTRAINT "user_how_heard_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_how_heard" ADD CONSTRAINT "user_how_heard_option_id_how_heard_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."how_heard_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "how_heard";