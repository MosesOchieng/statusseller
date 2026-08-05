import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";

const router = Router();

// GET /api/business/me
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [business] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, req.user!.userId))
      .limit(1);

    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch business profile" });
  }
});

// PATCH /api/business/me
router.patch("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, req.user!.userId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const allowed = [
      "name", "description", "logoUrl", "bannerUrl", "phone", "email",
      "location", "businessHours", "deliveryRadius", "whatsappLinked",
      "socialLinks", "shippingSettings", "paymentSettings",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const [updated] = await db
      .update(schema.businesses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.businesses.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update business profile" });
  }
});

// GET /api/business/kyb
router.get("/kyb", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [business] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, req.user!.userId))
      .limit(1);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const [kybRecord] = await db
      .select()
      .from(schema.kyb)
      .where(eq(schema.kyb.businessId, business.id))
      .limit(1);

    res.json({ kybStatus: business.kybStatus, kyb: kybRecord ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch KYB status" });
  }
});

// POST /api/business/kyb
router.post("/kyb", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [business] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, req.user!.userId))
      .limit(1);

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const { ownerFullName, nationalIdUrl, registrationNumber, businessCertUrl } =
      req.body as Record<string, string>;

    const [existing] = await db
      .select()
      .from(schema.kyb)
      .where(eq(schema.kyb.businessId, business.id))
      .limit(1);

    let kybRecord;
    if (existing) {
      [kybRecord] = await db
        .update(schema.kyb)
        .set({ ownerFullName, nationalIdUrl, registrationNumber, businessCertUrl, status: "pending", submittedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.kyb.businessId, business.id))
        .returning();
    } else {
      [kybRecord] = await db
        .insert(schema.kyb)
        .values({ businessId: business.id, ownerFullName, nationalIdUrl, registrationNumber, businessCertUrl, status: "pending", submittedAt: new Date() })
        .returning();
    }

    await db
      .update(schema.businesses)
      .set({ kybStatus: "under_review", updatedAt: new Date() })
      .where(eq(schema.businesses.id, business.id));

    res.json(kybRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit KYB" });
  }
});

export default router;
