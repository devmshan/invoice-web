"use client";

import Link from "next/link";
import { Menu, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface DashboardHeaderProps {
  // 페이지 제목 (breadcrumb 역할)
  title?: string;
}

// 대시보드 상단 헤더: 모바일 사이드바 + 알림 + 사용자 아바타
export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        {/* 모바일 햄버거 메뉴 - 기존 Sheet 컴포넌트 재활용 */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">사이드바 열기</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>네비게이션</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* 페이지 제목 */}
        {title && (
          <h1 className="text-foreground text-base font-semibold md:text-lg">
            {title}
          </h1>
        )}
      </div>

      {/* 우측 액션 영역 */}
      <div className="flex items-center gap-2">
        {/* 예제 목록으로 돌아가기 - Link에 buttonVariants 직접 적용 */}
        <Link
          href="/examples"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          aria-label="예제 목록으로 돌아가기"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">예제 목록</span>
        </Link>
        <Button variant="ghost" size="icon" aria-label="알림">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">홍</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
