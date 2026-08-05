import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  deviceInfo: varchar("device_info", { length: 500 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
