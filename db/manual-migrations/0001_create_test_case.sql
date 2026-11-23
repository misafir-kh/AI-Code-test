CREATE TABLE "test_case" (
  "id" text PRIMARY KEY NOT NULL,
  "repository_id" text NOT NULL REFERENCES "repository"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "test_type" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'medium',
  "target_route" text,
  "target_files" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "expected_result" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);