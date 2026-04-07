"use client";

// 서버 컴포넌트에서 클라이언트 컴포넌트(Sidebar)로 아이콘 함수를 직렬화 없이
// 전달하려면 이 컴포넌트도 "use client"여야 합니다.
import { Sidebar } from "@/components/layout/sidebar";
import { FileText, Settings } from "lucide-react";
import { LogoutButton } from "./logout-button";

// 관리자 전용 사이드바 컴포넌트
export function AdminSidebar() {
  return (
    <Sidebar
      navItems={[
        { href: "/admin/quotes", icon: FileText, label: "견적서" },
        { href: "/admin/settings", icon: Settings, label: "내 정보" },
      ]}
      logoHref="/admin"
      logoText="Invoice Admin"
      logoutSlot={<LogoutButton />}
    />
  );
}
