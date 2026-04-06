import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WINDOW_MS = 60 * 1000; // 1분
const MAX_REQUESTS = 30; // 1분당 최대 요청 수

const rateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}

function cleanup() {
  const now = Date.now();
  for (const [key, value] of rateLimit) {
    if (now > value.resetTime) rateLimit.delete(key);
  }
}

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimit.size > 100) cleanup();

  console.info(
    JSON.stringify({
      level: "info",
      method: request.method,
      path: request.nextUrl.pathname,
      ip,
    }),
  );

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quote/:path*"],
};
