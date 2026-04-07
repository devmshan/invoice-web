import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

const JWT_SECRET = new TextEncoder().encode(env.AUTH_SECRET);

export async function signToken(payload: { email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ email: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as { email: string };
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/admin",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin-token");
}

export async function verifyPassword(
  input: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(input, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
