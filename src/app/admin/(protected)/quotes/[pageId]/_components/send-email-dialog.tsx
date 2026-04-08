"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendQuoteEmailAction } from "../actions";

// 이메일 발송 폼 스키마
const sendEmailFormSchema = z.object({
  toEmail: z.string().email("유효한 이메일 주소를 입력해 주세요."),
});

type SendEmailFormValues = z.infer<typeof sendEmailFormSchema>;

interface SendEmailDialogProps {
  // 견적서 페이지 ID
  pageId: string;
  // 견적서 제목 (표시용)
  quoteTitle: string;
  // 다이얼로그 열림 여부
  open: boolean;
  // 다이얼로그 닫기 콜백
  onClose: () => void;
}

/**
 * 이메일 발송 확인 다이얼로그 컴포넌트
 * - 수신자 이메일 입력 및 확인
 * - Server Action 호출 후 성공/실패 toast 알림
 * - draft 상태 견적서 발송 시 자동으로 sent 상태로 변경
 */
export function SendEmailDialog({
  pageId,
  quoteTitle,
  open,
  onClose,
}: SendEmailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendEmailFormValues>({
    resolver: zodResolver(sendEmailFormSchema),
    defaultValues: { toEmail: "" },
  });

  // 다이얼로그 닫기 핸들러 (상태 초기화 포함)
  const handleClose = () => {
    if (isPending) return;
    reset();
    setIsSuccess(false);
    onClose();
  };

  // 이메일 발송 제출 핸들러
  const onSubmit = (values: SendEmailFormValues) => {
    startTransition(async () => {
      const result = await sendQuoteEmailAction(pageId, values.toEmail);

      if ("error" in result) {
        toast.error("이메일 발송 실패", {
          description: result.error,
        });
        return;
      }

      // 성공
      setIsSuccess(true);
      if (result.autoStatusChanged) {
        toast.success("이메일이 발송되었습니다", {
          description: "견적서 상태가 '발송됨'으로 변경되었습니다.",
        });
      } else {
        toast.success("이메일이 발송되었습니다");
      }

      // 1.5초 후 다이얼로그 닫기
      setTimeout(() => {
        handleClose();
      }, 1500);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 발송
          </DialogTitle>
          <DialogDescription>
            <strong>{quoteTitle}</strong> 견적서를 이메일로 발송합니다.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          // 발송 성공 상태 표시
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              이메일이 성공적으로 발송되었습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="toEmail">수신자 이메일</Label>
              <Input
                id="toEmail"
                type="email"
                placeholder="recipient@example.com"
                autoComplete="email"
                disabled={isPending}
                aria-invalid={!!errors.toEmail}
                {...register("toEmail")}
              />
              {errors.toEmail && (
                <p className="text-destructive text-sm">
                  {errors.toEmail.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  "발송"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
