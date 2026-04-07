"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuoteStatusBadge } from "../../_components/quote-status-badge";
import { changeQuoteStatus } from "../actions";
import type { QuoteStatus } from "@/lib/types";

// 상태 레이블 매핑
const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "초안",
  sent: "발송됨",
  accepted: "수락됨",
  rejected: "거절됨",
};

interface StatusChangeFormProps {
  pageId: string;
  currentStatus: QuoteStatus;
}

export function StatusChangeForm({
  pageId,
  currentStatus,
}: StatusChangeFormProps) {
  const [pendingStatus, setPendingStatus] = useState<QuoteStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 셀렉트 변경 시 확인 다이얼로그 열기
  const handleSelectChange = (value: string | null) => {
    if (!value) return;
    setPendingStatus(value as QuoteStatus);
    setDialogOpen(true);
  };

  // 다이얼로그 확인 시 상태 변경 Server Action 호출
  const handleConfirm = () => {
    if (!pendingStatus) return;
    startTransition(async () => {
      const result = await changeQuoteStatus(pageId, pendingStatus);
      if ("error" in result) {
        alert(result.error);
      }
      setDialogOpen(false);
      setPendingStatus(null);
    });
  };

  // 다이얼로그 취소 시 초기화
  const handleCancel = () => {
    setDialogOpen(false);
    setPendingStatus(null);
  };

  return (
    <>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">현재 상태</p>
        <div className="flex items-center gap-2">
          <QuoteStatusBadge status={currentStatus} />
          <Select onValueChange={handleSelectChange} disabled={isPending}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="상태 변경" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="sent">발송됨</SelectItem>
              <SelectItem value="accepted">수락됨</SelectItem>
              <SelectItem value="rejected">거절됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상태 변경 확인</AlertDialogTitle>
            <AlertDialogDescription>
              견적서 상태를{" "}
              <strong>
                {pendingStatus ? STATUS_LABELS[pendingStatus] : ""}
              </strong>
              (으)로 변경하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "변경 중..." : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
