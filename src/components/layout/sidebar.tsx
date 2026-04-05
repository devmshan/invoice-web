"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FileText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useMediaQuery, useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// 사이드바 네비게이션 링크 정의
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "분석" },
  { href: "/dashboard/users", icon: Users, label: "사용자" },
  { href: "/dashboard/content", icon: FileText, label: "콘텐츠" },
  { href: "/dashboard/settings", icon: Settings, label: "설정" },
];

// Route Group (dashboard)는 URL에 영향을 주지 않으므로
// 실제 경로: /dashboard, /dashboard/settings 등

// 데모용 사용자 정보
const demoUser = {
  name: "홍길동",
  email: "hong@example.com",
  initials: "홍",
};

interface SidebarProps {
  className?: string;
}

// 데스크톱 사이드바 컴포넌트
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  // 데스크톱 여부 감지 (768px 이상)
  // initializeWithValue: false → 서버/클라이언트 초기값 통일하여 hydration 오류 방지
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });
  // 사이드바 접힘 상태를 로컬스토리지에 저장 (기본값: 펼침)
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false,
  );

  // 모바일에서는 항상 펼침 상태로 표시 (Sheet 안에서 사용되므로)
  const collapsed = isDesktop && isCollapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60",
        className,
      )}
    >
      {/* 로고 + 접기 버튼 영역 */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <Link
            href="/"
            className="flex flex-1 items-center gap-2 font-bold text-lg"
          >
            <span className="text-primary">Next</span>
            <span>Starter</span>
          </Link>
        )}
        {/* 데스크톱에서만 접기/펼치기 토글 버튼 표시 */}
        {isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0", collapsed && "mx-auto")}
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // 정확한 경로 매칭: 대시보드 홈은 exact, 나머지는 startsWith
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {/* 접힌 상태에서는 텍스트 숨김 */}
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단: 사용자 정보 */}
      <div className="p-3">
        <Separator className="mb-3" />
        <div
          className={cn(
            "flex items-center rounded-md px-2 py-1.5",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {demoUser.initials}
            </AvatarFallback>
          </Avatar>
          {/* 접힌 상태에서는 이름/이메일 숨김 */}
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground truncate text-sm font-medium">
                  {demoUser.name}
                </p>
                <p className="text-sidebar-foreground/60 truncate text-xs">
                  {demoUser.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label="로그아웃"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
