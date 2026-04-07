import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const WINDOW_MS = 60 * 1000; // 1분
const MAX_LOGIN_FAILURES = 5;
const SLIDING_SESSION_THRESHOLD = 900; // 15분 미만 남으면 갱신

// 경로별 Rate Limit 설정
const RATE_LIMIT_MAP: Record<string, number> = {
  "/admin/login": 5,
  "/admin": 60,
  "/quote": 30,
};

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

function getRateLimit(pathname: string): number {
  if (pathname.startsWith("/admin/login"))
    return RATE_LIMIT_MAP["/admin/login"];
  if (pathname.startsWith("/admin")) return RATE_LIMIT_MAP["/admin"];
  return RATE_LIMIT_MAP["/quote"];
}

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > max;
}

function isLoginLocked(ip: string): boolean {
  const now = Date.now();
  const entry = loginFailures.get(ip);
  if (!entry) return false;
  if (now > entry.lockedUntil) {
    loginFailures.delete(ip);
    return false;
  }
  return entry.count > MAX_LOGIN_FAILURES;
}

function cleanup() {
  const now = Date.now();
  for (const [key, value] of rateLimit) {
    if (now > value.resetTime) rateLimit.delete(key);
  }
  for (const [key, value] of loginFailures) {
    if (now > value.lockedUntil) loginFailures.delete(key);
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimit.size + loginFailures.size > 200) cleanup();

  console.info(
    JSON.stringify({
      level: "info",
      method: request.method,
      path: pathname,
      ip,
    }),
  );

  // Rate Limit 적용
  const maxRequests = getRateLimit(pathname);
  const rateLimitKey = `${ip}:${pathname.startsWith("/admin/login") ? "login" : pathname.startsWith("/admin") ? "admin" : "quote"}`;

  if (isRateLimited(rateLimitKey, maxRequests)) {
    console.info(
      JSON.stringify({
        level: "warn",
        event: "rate_limit_exceeded",
        path: pathname,
        ip,
      }),
    );
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // /admin/login 브루트포스 방어
  if (pathname.startsWith("/admin/login")) {
    if (isLoginLocked(ip)) {
      console.info(
        JSON.stringify({
          level: "warn",
          event: "login_locked",
          ip,
        }),
      );
      return NextResponse.json(
        { error: "Too many failed login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }
    return NextResponse.next();
  }

  // /admin/* 경로 보호 (login 제외)
  if (pathname.startsWith("/admin")) {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const JWT_SECRET = new TextEncoder().encode(authSecret);
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const exp = payload.exp as number | undefined;
      const now = Math.floor(Date.now() / 1000);

      const response = NextResponse.next();

      // 슬라이딩 세션: 만료 15분 미만 남으면 토큰 갱신
      if (exp && exp - now < SLIDING_SESSION_THRESHOLD) {
        const newToken = await new SignJWT({ email: payload.email })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1h")
          .sign(JWT_SECRET);

        response.cookies.set("admin-token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3600,
          path: "/admin",
        });
      }

      return response;
    } catch {
      console.info(
        JSON.stringify({
          level: "warn",
          event: "invalid_token",
          path: pathname,
          ip,
        }),
      );
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.cookies.delete("admin-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quote/:path*", "/admin/:path*"],
};
