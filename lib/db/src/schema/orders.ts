import { pgTable, uuid, varchar, text, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businesses } from "./businesses";

export const orderStatusEnum = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

export const paymentStatusEnum = ["pending", "paid", "refunded"] as const;
export type PaymentStatus = (typeof paymentStatusEnum)[number];

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerAddress: text("customer_address"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("KSh").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending").notNull(),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  notes: text("notes"),
  // items: [{productId, productTitle, productImage, quantity, price, variant?, colorHex?}]
  items: jsonb("items").$type<Array<{
    productId: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    price: number;
    variant?: string;
    colorHex?: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrderSchema = insertOrderSchema.partial().omit({ businessId: true, orderNumber: true });

export const selectOrderSchema = createSelectSchema(orders);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
