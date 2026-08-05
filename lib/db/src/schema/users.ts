import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 50 }).unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
  emailVerified: true,
  phoneVerified: true,
});

export const selectUserSchema = createSelectSchema(users).omit({ passwordHash: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "passwordHash">;
