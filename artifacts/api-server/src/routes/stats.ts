import { Router } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { requireBusiness, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";

const router = Router();

// GET /api/stats
router.get("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    // Total products
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.products)
      .where(eq(schema.products.businessId, businessId));

    // Today orders
    const [todayOrdersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.businessId, businessId),
          gte(schema.orders.createdAt, todayStart),
        ),
      );

    // Today revenue (paid orders only)
    const [todayRevenueResult] = await db
      .select({ sum: sql<string>`coalesce(sum(total::numeric), 0)::text` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.businessId, businessId),
          eq(schema.orders.paymentStatus, "paid"),
          gte(schema.orders.createdAt, todayStart),
        ),
      );

    // Week revenue (last 7 days by day)
    const weekRevenue: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [dayResult] = await db
        .select({ sum: sql<string>`coalesce(sum(total::numeric), 0)::text` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.businessId, businessId),
            eq(schema.orders.paymentStatus, "paid"),
            gte(schema.orders.createdAt, dayStart),
            sql`${schema.orders.createdAt} < ${dayEnd}`,
          ),
        );

      weekRevenue.push(parseFloat(dayResult?.sum ?? "0"));
    }

    // Total orders
    const [totalOrdersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(eq(schema.orders.businessId, businessId));

    // Conversion rate: delivered / total * 100
    const [deliveredResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(and(eq(schema.orders.businessId, businessId), eq(schema.orders.status, "delivered")));

    const total = totalOrdersResult?.count ?? 0;
    const delivered = deliveredResult?.count ?? 0;
    const conversionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

    // Business totals
    const [business] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.id, businessId))
      .limit(1);

    res.json({
      todayRevenue: parseFloat(todayRevenueResult?.sum ?? "0"),
      weekRevenue,
      todayOrders: todayOrdersResult?.count ?? 0,
      totalProducts: productCount?.count ?? 0,
      activeLinks: productCount?.count ?? 0,
      aiConversations: 0,
      linkClicks: 0,
      conversionRate,
      currency: "KSh",
      totalSales: business?.totalSales ?? 0,
      totalRevenue: parseFloat(String(business?.totalRevenue ?? "0")),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
