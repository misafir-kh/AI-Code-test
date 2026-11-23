ALTER TABLE "test_case"
  ADD COLUMN IF NOT EXISTS "last_run_browserbase_session_id" text,
  ADD COLUMN IF NOT EXISTS "last_run_browserbase_session_url" text;
