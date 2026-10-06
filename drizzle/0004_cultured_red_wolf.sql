ALTER TABLE "documents" ADD COLUMN "document_hash" text;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_hash_unique" UNIQUE("user_id","document_hash");