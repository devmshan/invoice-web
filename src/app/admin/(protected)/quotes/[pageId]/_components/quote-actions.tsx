"use client";

import { useState } from "react";
import { Mail, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { ComboButton } from "@/components/ui/combo-button";
import { SendEmailDialog } from "./send-email-dialog";
import type { QuoteStatus } from "@/lib/types";

interface QuoteActionsProps {
  pageId: string;
  status: QuoteStatus;
  quoteTitle: string;
}

/**
 * 견적서 관리자 액션 콤보 버튼 컴포넌트
 * - 기본 액션: 이메일 발송 다이얼로그 오픈
 * - 드롭다운: 링크 복사
 * - draft 상태에서는 전체 비활성화
 */
export function QuoteActions({
  pageId,
  status,
  quoteTitle,
}: QuoteActionsProps) {
  // 이메일 발송 다이얼로그 오픈 상태
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // draft 상태에서는 전체 비활성화
  const isDraft = status === "draft";

  // 견적서 공유 링크 복사 핸들러
  const handleCopyLink = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    const url = `${baseUrl}/quote/${pageId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다", {
        description: url,
      });
    } catch {
      toast.error("링크 복사에 실패했습니다", {
        description: "브라우저에서 클립보드 접근을 허용해 주세요.",
      });
    }
  };

  return (
    <>
      <ComboButton
        primaryLabel="이메일 발송"
        primaryIcon={<Mail className="h-4 w-4" />}
        primaryAction={() => setEmailDialogOpen(true)}
        disabled={isDraft}
        items={[
          {
            label: "링크 복사",
            icon: <LinkIcon className="h-4 w-4" />,
            action: handleCopyLink,
            disabled: isDraft,
          },
        ]}
      />

      {/* 이메일 발송 확인 다이얼로그 */}
      <SendEmailDialog
        pageId={pageId}
        quoteTitle={quoteTitle}
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
      />
    </>
  );
}
