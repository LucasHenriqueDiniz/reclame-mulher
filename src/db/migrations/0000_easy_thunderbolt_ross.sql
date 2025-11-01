CREATE TYPE "public"."app_role" AS ENUM('USER', 'COMPANY', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('OPEN', 'RESPONDED', 'RESOLVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."sender_type" AS ENUM('USER', 'COMPANY', 'ADMIN');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"content_md" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cnpj" text,
	"corporate_name" text,
	"sector" text,
	"website" text,
	"contact_phone" text,
	"responsible_name" text,
	"responsible_title" text,
	"responsible_email" text,
	"slug" text,
	"logo_url" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "company_users" (
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"role" text DEFAULT 'MEMBER',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaint_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"sender_type" "sender_type" NOT NULL,
	"author_id" uuid,
	"content" text NOT NULL,
	"attachment_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"occurred_at" timestamp with time zone,
	"expected_solution" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" "complaint_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"role" "app_role" DEFAULT 'USER' NOT NULL,
	"cpf" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"how_heard" text,
	"accepted_terms_at" timestamp with time zone,
	"onboarding_completed_at" timestamp with time zone,
	"avatar_url" text,
	"locale" text,
	"provider" text,
	"provider_id" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'PLANNING' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
