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

    const payload = { userId: newUser!.id, businessId: newBusiness!.id, email: newUser!.email };
    const accessToken = signAccessToken(payload);
    const refreshTokenStr = signRefreshToken(payload);

    await db.insert(schema.refreshTokens).values({
      userId: newUser!.id,
      token: refreshTokenStr,
      expiresAt: getRefreshExpiryDate(),
    });

    const { passwordHash: _ph, ...safeUser } = newUser!;
    res.status(201).json({ accessToken, refreshToken: refreshTokenStr, user: safeUser, business: newBusiness });
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

    const payload = {
      userId: user.id,
      businessId: business?.id ?? null,
      email: user.email,
    };
    const accessToken = signAccessToken(payload);
    const refreshTokenStr = signRefreshToken(payload);

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshTokenStr,
      expiresAt: getRefreshExpiryDate(),
    });

    const { passwordHash: _ph, ...safeUser } = user;
    res.json({ accessToken, refreshToken: refreshTokenStr, user: safeUser, business: business ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
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
