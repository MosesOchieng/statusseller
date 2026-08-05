import { pgTable, uuid, varchar, text, boolean, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businesses } from "./businesses";

export const productStatusEnum = ["active", "draft", "out_of_stock"] as const;
export type ProductStatus = (typeof productStatusEnum)[number];

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("KSh").notNull(),
  category: varchar("category", { length: 255 }),
  stock: integer("stock").default(0).notNull(),
  sku: varchar("sku", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  shopLink: varchar("shop_link", { length: 500 }),
  views: integer("views").default(0).notNull(),
  orders: integer("orders").default(0).notNull(),
  colorHex: varchar("color_hex", { length: 10 }),
  // variants stored as JSON: [{name: string, options: string[]}]
  variants: jsonb("variants").$type<Array<{ name: string; options: string[] }>>().default([]),
  // image URLs stored as JSON array of strings
  images: jsonb("images").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  views: true,
  orders: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial().omit({ businessId: true });

export const selectProductSchema = createSelectSchema(products);

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
