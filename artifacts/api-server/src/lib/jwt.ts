import jwt from "jsonwebtoken";

const isDev = process.env["NODE_ENV"] === "development";
const secret = process.env["SESSION_SECRET"] ?? process.env["JWT_SECRET"];

if (!secret) {
  if (!isDev) {
    throw new Error(
      "SESSION_SECRET environment variable is required in non-development environments",
    );
  }
  // In development only, fall back to a local-only default that is never usable in production
  console.warn(
    "[jwt] SESSION_SECRET not set — using insecure dev-only fallback. Do not deploy this.",
  );
}

const JWT_SECRET = secret ?? "dev-only-secret-DO-NOT-DEPLOY";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

export interface JwtPayload {
  userId: string;
  businessId: string | null;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getRefreshExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}
