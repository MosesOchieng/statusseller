import { Router } from "express";
import { eq, or } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getRefreshExpiryDate,
} from "../lib/jwt";
import type { Request, Response } from "express";

const router = Router();
const DEMO_EMAIL = "urbanwear@gmail.com";
const DEMO_PASSWORD = "demo1234";

async function createAuthSession(
  user: typeof schema.users.$inferSelect,
  business: typeof schema.businesses.$inferSelect | null,
) {
  const payload = { userId: user.id, businessId: business?.id ?? null, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshTokenStr = signRefreshToken(payload);

  await db.insert(schema.refreshTokens).values({
    userId: user.id,
    token: refreshTokenStr,
    expiresAt: getRefreshExpiryDate(),
  });

  const { passwordHash: _ph, ...safeUser } = user;
  return { accessToken, refreshToken: refreshTokenStr, user: safeUser, business };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, businessName } = req.body as {
      fullName: string;
      email: string;
      phone?: string;
      password: string;
      businessName: string;
    };

    if (!fullName || !email || !password || !businessName) {
      res.status(400).json({ error: "fullName, email, password, and businessName are required" });
      return;
    }

    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(schema.users)
      .values({
        fullName,
        email: email.toLowerCase(),
        phone: phone ?? null,
        passwordHash,
      })
      .returning();

    const [newBusiness] = await db
      .insert(schema.businesses)
      .values({
        userId: newUser!.id,
        name: businessName,
        email: email.toLowerCase(),
        phone: phone ?? null,
      })
      .returning();

    res.status(201).json(await createAuthSession(newUser!, newBusiness!));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
// Accepts email or phone in the `emailOrPhone` field
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body as { emailOrPhone: string; password: string };

    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "emailOrPhone and password are required" });
      return;
    }

    const identifier = emailOrPhone.trim().toLowerCase();

    // Query by email OR phone — covers both login paths
    const [user] = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.email, identifier),
          eq(schema.users.phone, emailOrPhone.trim()), // phone stored as-is (e.g. +254…)
        ),
      )
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const [business] = await db
      .select()
      .from(schema.businesses)
      .where(eq(schema.businesses.userId, user.id))
      .limit(1);

    res.json(await createAuthSession(user, business ?? null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/demo
// Idempotently provisions a safe, sample store for product demos.
router.post("/demo", async (_req: Request, res: Response) => {
  try {
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const result = await db.transaction(async (tx) => {
      let [user] = await tx
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, DEMO_EMAIL))
        .limit(1);

      if (!user) {
        [user] = await tx
          .insert(schema.users)
          .values({
            fullName: "Demo Merchant",
            email: DEMO_EMAIL,
            passwordHash,
            emailVerified: true,
          })
          .returning();
      }

      let [business] = await tx
        .select()
        .from(schema.businesses)
        .where(eq(schema.businesses.userId, user!.id))
        .limit(1);

      if (!business) {
        [business] = await tx
          .insert(schema.businesses)
          .values({
            userId: user!.id,
            name: "Urban Wear KE",
            description: "Classic shoes and everyday streetwear.",
            email: DEMO_EMAIL,
            phone: "+254 700 000 000",
            location: "Nairobi, Kenya",
            businessHours: "Mon-Sat: 8AM - 8PM",
            kybStatus: "approved",
            whatsappLinked: true,
          })
          .returning();
      }

      const existingProducts = await tx
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(eq(schema.products.businessId, business!.id))
        .limit(1);

      if (existingProducts.length === 0) {
        await tx.insert(schema.products).values([
          {
            businessId: business!.id,
            title: "Nike Air Force 1",
            description: "A clean everyday classic with all-day comfort.",
            price: "6000",
            originalPrice: "7500",
            currency: "KSh",
            category: "Sneakers",
            stock: 12,
            status: "active",
            shopLink: "statusseller.app/p/demo-air-force-1",
            colorHex: "#D97706",
            variants: [{ name: "Size", options: ["40", "41", "42", "43", "44"] }],
            images: [],
          },
          {
            businessId: business!.id,
            title: "Classic Oxford Shoes",
            description: "Polished leather shoes for work and special occasions.",
            price: "5200",
            currency: "KSh",
            category: "Formal",
            stock: 8,
            status: "active",
            shopLink: "statusseller.app/p/demo-oxford-shoes",
            colorHex: "#1A1A2E",
            variants: [{ name: "Size", options: ["40", "41", "42", "43"] }],
            images: [],
          },
        ]);
      }

      return { user: user!, business: business! };
    });

    res.json(await createAuthSession(result.user, result.business));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Demo store could not be started" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const [stored] = await db
      .select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.token, refreshToken))
      .limit(1);

    if (!stored) {
      res.status(401).json({ error: "Refresh token not found" });
      return;
    }

    if (stored.expiresAt < new Date()) {
      await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));
      res.status(401).json({ error: "Refresh token expired" });
      return;
    }

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      businessId: payload.businessId,
      email: payload.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
