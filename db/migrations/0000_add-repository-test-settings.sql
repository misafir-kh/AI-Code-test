ALTER TABLE "repository"
ADD COLUMN IF NOT EXISTS "target_url" text;
--> statement-breakpoint
ALTER TABLE "repository"
ADD COLUMN IF NOT EXISTS "test_instructions" text;