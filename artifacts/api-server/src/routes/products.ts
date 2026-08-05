import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { requireBusiness, type AuthRequest } from "../middlewares/auth";
import type { Response } from "express";
import { generateLinkCode } from "../lib/utils";
import { getParam } from "../lib/params";

const router = Router();

// GET /api/products
router.get("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.businessId, req.user!.businessId!))
      .orderBy(desc(schema.products.createdAt));

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.businessId, req.user!.businessId!)))
      .limit(1);

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products
router.post("/", requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, originalPrice, currency, category, stock, sku, status, variants, images, colorHex } =
      req.body as Record<string, unknown>;

    if (!title || price === undefined) {
      res.status(400).json({ error: "title and price are required" });
      return;
    }

    const linkCode = generateLinkCode();
    const shopLink = `statusseller.app/p/${linkCode}`;

    const [product] = await db
      .insert(schema.products)
      .values({
        businessId: req.user!.businessId!,
        title: title as string,
        description: description as string | undefined,
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        currency: (currency as string) ?? "KSh",
        category: category as string | undefined,
        stock: (stock as number) ?? 0,
        sku: sku as string | undefined,
        status: (status as string) ?? "draft",
        shopLink,
        variants: (variants as Array<{ name: string; options: string[] }>) ?? [],
        images: (images as string[]) ?? [],
        colorHex: colorHex as string | undefined,
      })
      .returning();

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PATCH /api/products/:id
router.patch("/:id", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    const [existing] = await db
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.businessId, req.user!.businessId!)))
      .limit(1);

    if (!existing) { res.status(404).json({ error: "Product not found" }); return; }

    const allowed = ["title", "description", "price", "originalPrice", "currency", "category", "stock", "sku", "status", "variants", "images", "colorHex"] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = ["price", "originalPrice"].includes(key) ? String(req.body[key]) : req.body[key];
      }
    }

    const [updated] = await db
      .update(schema.products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.products.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", requireBusiness, async (req: AuthRequest, res: Response) => {
  const id = getParam(req.params, "id");
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  try {
    const [existing] = await db
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.businessId, req.user!.businessId!)))
      .limit(1);

    if (!existing) { res.status(404).json({ error: "Product not found" }); return; }

    await db.delete(schema.products).where(eq(schema.products.id, existing.id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
