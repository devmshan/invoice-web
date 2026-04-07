"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { clearAuthCookie } from "@/lib/auth";
import { auditLogger } from "@/lib/logger";

export async function logoutAction(): Promise<never> {
  const { email } = await requireAdmin();
  await clearAuthCookie();
  auditLogger.info({ email }, "Admin logout");
  redirect("/admin/login");
}
