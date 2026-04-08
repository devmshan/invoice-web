"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// 드롭다운 메뉴 아이템 타입
export interface ComboButtonItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

// 콤보 버튼 props
export interface ComboButtonProps {
  // 기본 버튼 레이블
  primaryLabel: string;
  // 기본 버튼 아이콘 (선택)
  primaryIcon?: React.ReactNode;
  // 기본 버튼 클릭 핸들러
  primaryAction: () => void;
  // 드롭다운 메뉴 아이템 목록
  items: ComboButtonItem[];
  // 전체 비활성화 여부 (draft 상태 등)
  disabled?: boolean;
  className?: string;
}

/**
 * Split Button (콤보 버튼) 컴포넌트
 * - 기본 액션 버튼 + 추가 액션 드롭다운 메뉴 조합
 * - disabled 시 전체 버튼 비활성화
 */
export function ComboButton({
  primaryLabel,
  primaryIcon,
  primaryAction,
  items,
  disabled = false,
  className,
}: ComboButtonProps) {
  return (
    <div
      className={cn("flex items-center", className)}
      data-slot="combo-button"
    >
      {/* 기본 액션 버튼 */}
      <Button
        variant="outline"
        className="rounded-r-none border-r-0"
        onClick={primaryAction}
        disabled={disabled}
      >
        {primaryIcon}
        {primaryLabel}
      </Button>

      {/* 드롭다운 트리거 버튼 */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-none px-2"
              disabled={disabled}
              aria-label="추가 옵션"
            />
          }
        >
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={item.action}
              disabled={item.disabled ?? disabled}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
