"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 라이트 / 다크 / 시스템 테마 전환 버튼 컴포넌트
 * - DropdownMenu로 세 가지 테마 선택
 * - 현재 테마에 따라 아이콘 변경 (Sun / Moon / Monitor)
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="테마 전환"
            className="relative"
          />
        }
      >
        {/* 현재 테마에 따라 아이콘 전환 */}
        <Sun className="h-5 w-5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        <span className="sr-only">테마 전환</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "font-semibold" : ""}
        >
          <Sun className="h-4 w-4" />
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "font-semibold" : ""}
        >
          <Moon className="h-4 w-4" />
          다크
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "font-semibold" : ""}
        >
          <Monitor className="h-4 w-4" />
          시스템
          {resolvedTheme && (
            <span className="text-muted-foreground ml-1 text-xs">
              ({resolvedTheme === "dark" ? "다크" : "라이트"})
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
