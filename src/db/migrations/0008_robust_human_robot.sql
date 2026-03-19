ALTER TABLE "complaint_attachments" ALTER COLUMN "size_bytes" SET DATA TYPE bigint;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_unique" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "companies_deleted_at_idx" ON "companies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "companies_verified_at_idx" ON "companies" USING btree ("verified_at");--> statement-breakpoint
CREATE INDEX "complaint_messages_complaint_id_idx" ON "complaint_messages" USING btree ("complaint_id");--> statement-breakpoint
CREATE INDEX "complaints_company_status_idx" ON "complaints" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "complaints_author_id_idx" ON "complaints" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "complaints_is_public_idx" ON "complaints" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "projects_company_status_idx" ON "projects" USING btree ("company_id","status");