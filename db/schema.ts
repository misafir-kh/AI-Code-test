import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export type TestStepRole =
  | "button"
  | "link"
  | "textbox"
  | "checkbox"
  | "radio"
  | "heading"
  | "combobox"
  | "option";

export type TestStep =
  | { action: "navigate"; path: string }
  | { action: "click"; role: TestStepRole; name: string }
  | {
      action: "fill";
      role: TestStepRole;
      name: string;
      value: string;
    }
  | { action: "expectText"; text: string }
  | { action: "expectVisible"; role: TestStepRole; name: string };

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const repositories = pgTable("repository", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  repoId: integer("repo_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  private: boolean("private").notNull(),
  htmlUrl: text("html_url").notNull(),
  description: text("description"),
  owner: text("owner").notNull(),
  targetUrl: text("target_url"),
  testInstructions: text("test_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const testCases = pgTable("test_case", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  testType: text("test_type").notNull(),
  priority: text("priority").notNull().default("medium"),
  targetRoute: text("target_route"),
  targetFiles: jsonb("target_files")
    .$type<string[]>()
    .notNull()
    .default([]),
  expectedResult: text("expected_result").notNull(),
  testSteps: jsonb("test_steps")
    .$type<TestStep[]>()
    .notNull()
    .default([]),
  lastRunStatus: text("last_run_status"),
  lastRunLogs: jsonb("last_run_logs")
    .$type<string[]>()
    .notNull()
    .default([]),
  lastRunAt: timestamp("last_run_at"),
  lastRunBrowserbaseSessionId: text("last_run_browserbase_session_id"),
  lastRunBrowserbaseSessionUrl: text("last_run_browserbase_session_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
