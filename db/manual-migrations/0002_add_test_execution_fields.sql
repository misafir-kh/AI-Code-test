ALTER TABLE "test_case"
  ADD COLUMN IF NOT EXISTS "test_steps" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "last_run_status" text,
  ADD COLUMN IF NOT EXISTS "last_run_logs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "last_run_at" timestamp without time zone;
