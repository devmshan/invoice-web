"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas/auth";
import { getAdminPasswordHash } from "@/lib/kv";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import { securityLogger } from "@/lib/logger";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { email, password } = parsed.data;

  const passwordHash = await getAdminPasswordHash();
  if (!passwordHash) {
    securityLogger.warn(
      { email },
      "Login attempt: no password hash configured",
    );
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const isValid = await verifyPassword(password, passwordHash);
  if (!isValid) {
    securityLogger.warn({ email }, "Login attempt: invalid credentials");
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const token = await signToken({ email });
  await setAuthCookie(token);

  securityLogger.info({ email }, "Login successful");

  redirect("/admin");
}
