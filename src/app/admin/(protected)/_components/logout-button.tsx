"use client";

import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// 관리자 로그아웃 버튼 — Server Action을 form으로 실행
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        aria-label="로그아웃"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
