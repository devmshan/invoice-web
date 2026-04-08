"use client";

// 관리자 헤더 — DashboardHeader에 adminNavItems를 직접 조립하여 전달
// 아이콘 컴포넌트를 클라이언트 컴포넌트 내부에서 import해야
// 서버 → 클라이언트 props 직렬화 문제를 피할 수 있음
import { FileText, Settings } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "./logout-button";

const sidebarProps = {
  navItems: [
    { href: "/admin/quotes", icon: FileText, label: "견적서" },
    { href: "/admin/settings", icon: Settings, label: "내 정보" },
  ],
  logoHref: "/admin",
  logoText: "Invoice Admin",
  logoutSlot: <LogoutButton />,
};

export function AdminHeader() {
  return (
    <DashboardHeader
      showBackLink={false}
      sidebarProps={sidebarProps}
      rightSlot={<ThemeToggle />}
    />
  );
}
