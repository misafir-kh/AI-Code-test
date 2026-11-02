import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

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