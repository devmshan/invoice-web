import { requireAdmin } from "@/lib/auth-guard";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";

// 관리자 보호 레이아웃 — requireAdmin()으로 인증 검증 후 렌더링
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 데스크톱에서만 사이드바 표시 */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 헤더: 아이콘 직렬화 문제 방지를 위해 클라이언트 래퍼 AdminHeader 사용 */}
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
