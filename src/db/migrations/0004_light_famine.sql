CREATE TYPE "public"."how_heard_type" AS ENUM('LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'AMIGOS', 'GOOGLE', 'YOUTUBE', 'EVENTO', 'OUTRO');--> statement-breakpoint
DROP TABLE "how_heard_options" CASCADE;--> statement-breakpoint
DROP TABLE "user_how_heard" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "how_heard" "how_heard_type";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "how_heard_other" text;--> statement-breakpoint
DROP TYPE "public"."how_heard_source_type";