import { Router } from "express";
import { eq, or } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { getParam } from "../lib/params";

const router = Router();

// Public customer lookup for links shared in WhatsApp Status and social posts.
router.get("/shop/:code", async (req, res) => {
  const code = getParam(req.params, "code");
  if (!code) {
    res.status(400).json({ error: "Missing shop code" });
    return;
  }

  try {
    const publicAppUrl = (process.env["PUBLIC_APP_URL"] ?? "https://statusseller.app").replace(/\/$/, "");
    const [result] = await db
      .select({
        product: schema.products,
        business: schema.businesses,
      })
      .from(schema.products)
      .innerJoin(schema.businesses, eq(schema.products.businessId, schema.businesses.id))
      .where(
        or(
          eq(schema.products.shopLink, `${publicAppUrl}/p/${code}`),
          eq(schema.products.shopLink, `statusseller.app/p/${code}`),
        ),
      )
      .limit(1);

    if (!result || result.product.status !== "active") {
      res.status(404).json({ error: "Shop link not found" });
      return;
    }

    res.json({
      product: result.product,
      store: {
        name: result.business.name,
        description: result.business.description,
        phone: result.business.phone,
        location: result.business.location,
        verified: result.business.kybStatus === "approved",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load shop link" });
  }
});

export default router;