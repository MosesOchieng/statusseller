import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { requireBusiness, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";
import { getParam } from "../lib/params";

const router = Router();

// GET /api/notifications
router.get("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.businessId, req.user!.businessId!))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(
        and(
          eq(schema.notifications.businessId, req.user!.businessId!),
          eq(schema.notifications.read, false),
        ),
      );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.businessId, req.user!.businessId!),
        ),
      );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;
