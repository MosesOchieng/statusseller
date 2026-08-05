import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessage = typeof aiMessages.$inferSelect;
