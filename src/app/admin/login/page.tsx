import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./_components/login-form";

// 로그인 페이지 — 이미 로그인된 경우 관리자 홈으로 리다이렉트
export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has("admin-token")) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <LoginForm />
    </div>
  );
}
