import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export async function requireAdmin(): Promise<{ email: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    return await verifyToken(token);
  } catch {
    redirect("/admin/login");
  }
}
