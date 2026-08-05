import { pgTable, uuid, varchar, text, boolean, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const kybStatusEnum = ["pending", "under_review", "approved", "rejected"] as const;
export type KybStatus = (typeof kybStatusEnum)[number];

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  location: varchar("location", { length: 500 }),
  businessHours: varchar("business_hours", { length: 255 }),
  deliveryRadius: varchar("delivery_radius", { length: 255 }),
  whatsappLinked: boolean("whatsapp_linked").default(false).notNull(),
  kybStatus: varchar("kyb_status", { length: 50 }).default("pending").notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSales: integer("total_sales").default(0).notNull(),
  totalRevenue: numeric("total_revenue", { precision: 14, scale: 2 }).default("0.00").notNull(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),
  shippingSettings: jsonb("shipping_settings").$type<Record<string, unknown>>(),
  paymentSettings: jsonb("payment_settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kyb = pgTable("kyb", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  ownerFullName: varchar("owner_full_name", { length: 255 }),
  nationalIdUrl: text("national_id_url"),
  registrationNumber: varchar("registration_number", { length: 100 }),
  businessCertUrl: text("business_cert_url"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  kybStatus: true,
  totalSales: true,
  totalRevenue: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBusinessSchema = insertBusinessSchema.partial().omit({ userId: true });

export const selectBusinessSchema = createSelectSchema(businesses);

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type Kyb = typeof kyb.$inferSelect;
