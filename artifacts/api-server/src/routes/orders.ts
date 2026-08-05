import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { requireBusiness, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";
import { getParam } from "../lib/params";

const router = Router();

// GET /api/orders
router.get("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.businessId, req.user!.businessId!))
      .orderBy(desc(schema.orders.createdAt));

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id
router.get("/:id", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(and(eq(schema.orders.id, id), eq(schema.orders.businessId, req.user!.businessId!)))
      .limit(1);

    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders
router.post("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName, customerPhone, customerEmail, customerAddress,
      items, subtotal, deliveryFee, total, currency,
      paymentMethod, paymentStatus, notes,
    } = req.body as Record<string, unknown>;

    if (!customerName || !subtotal || !total || !items) {
      res.status(400).json({ error: "customerName, items, subtotal, and total are required" });
      return;
    }

    const orderNumber = `SS-${Date.now().toString(36).toUpperCase()}`;

    const [order] = await db
      .insert(schema.orders)
      .values({
        businessId: req.user!.businessId!,
        orderNumber,
        customerName: customerName as string,
        customerPhone: customerPhone as string | undefined,
        customerEmail: customerEmail as string | undefined,
        customerAddress: customerAddress as string | undefined,
        subtotal: String(subtotal),
        deliveryFee: String(deliveryFee ?? 0),
        total: String(total),
        currency: (currency as string) ?? "KSh",
        status: "pending",
        paymentMethod: paymentMethod as string | undefined,
        paymentStatus: (paymentStatus as string) ?? "pending",
        notes: notes as string | undefined,
        items: items as typeof schema.orders.$inferInsert["items"],
      })
      .returning();

    try {
      await db.insert(schema.notifications).values({
        businessId: req.user!.businessId!,
        type: "order",
        title: "New Order",
        body: `Order ${orderNumber} received from ${customerName as string}`,
      });
    } catch { /* non-critical */ }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }

  const { status } = req.body as { status: string };
  const validStatuses = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled", "refunded"];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status value" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(schema.orders)
      .where(and(eq(schema.orders.id, id), eq(schema.orders.businessId, req.user!.businessId!)))
      .limit(1);

    if (!existing) { res.status(404).json({ error: "Order not found" }); return; }

    const [updated] = await db
      .update(schema.orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.orders.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// PATCH /api/orders/:id
router.patch("/:id", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    const [existing] = await db
      .select()
      .from(schema.orders)
      .where(and(eq(schema.orders.id, id), eq(schema.orders.businessId, req.user!.businessId!)))
      .limit(1);

    if (!existing) { res.status(404).json({ error: "Order not found" }); return; }

    const allowed = ["status", "paymentStatus", "trackingNumber", "notes"] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const [updated] = await db
      .update(schema.orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.orders.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
