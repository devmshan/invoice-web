"use client";

import { useActionState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "../actions";

// 비밀번호 복잡도 검사를 위한 클라이언트 스키마 (UI 피드백용)
const passwordClientSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해 주세요."),
  newPassword: z
    .string()
    .min(8, "최소 8자 이상")
    .max(72, "최대 72자 이하")
    .regex(/[A-Z]/, "대문자 포함")
    .regex(/[a-z]/, "소문자 포함")
    .regex(/[0-9]/, "숫자 포함")
    .regex(/[^A-Za-z0-9]/, "특수문자 포함"),
  confirmPassword: z.string().min(1, "비밀번호 확인을 입력해 주세요."),
});

type PasswordFormValues = z.infer<typeof passwordClientSchema>;

// 비밀번호 복잡도 요구사항 목록
const PASSWORD_REQUIREMENTS = [
  {
    key: "length",
    label: "최소 8자 이상 (최대 72자)",
    test: (v: string) => v.length >= 8 && v.length <= 72,
  },
  {
    key: "upper",
    label: "대문자 1개 이상",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    key: "lower",
    label: "소문자 1개 이상",
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    key: "number",
    label: "숫자 1개 이상",
    test: (v: string) => /[0-9]/.test(v),
  },
  {
    key: "special",
    label: "특수문자 1개 이상",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

/**
 * 비밀번호 변경 폼 컴포넌트
 * - React Hook Form + Zod 검증
 * - 비밀번호 복잡도 실시간 피드백
 * - useActionState로 Server Action 연동
 */
export function ChangePasswordForm() {
  const [actionState, formAction, isPending] = useActionState(
    changePassword,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // 비밀번호 가시성 토글 상태
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordClientSchema),
    mode: "onChange",
  });

  // 새 비밀번호 실시간 값 감시 (복잡도 피드백용)
  const newPasswordValue = useWatch({
    control,
    name: "newPassword",
    defaultValue: "",
  });
  const confirmPasswordValue = useWatch({
    control,
    name: "confirmPassword",
    defaultValue: "",
  });

  // 서버 액션 에러 발생 시 폼 리셋 방지 (에러 표시 유지)
  useEffect(() => {
    if (actionState?.error) {
      // 에러 상태 유지, 폼은 초기화하지 않음
    }
  }, [actionState]);

  // 비밀번호 일치 여부
  const passwordsMatch =
    confirmPasswordValue.length > 0 &&
    newPasswordValue === confirmPasswordValue;
  const passwordsMismatch =
    confirmPasswordValue.length > 0 &&
    newPasswordValue !== confirmPasswordValue;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="max-w-md space-y-5"
      onSubmit={() => reset()}
    >
      {/* 서버 액션 에러 표시 */}
      {actionState?.error && (
        <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
          {actionState.error}
        </div>
      )}

      {/* 현재 비밀번호 */}
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">현재 비밀번호</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            disabled={isPending}
            aria-invalid={!!errors.currentPassword}
            className="pr-10"
            {...register("currentPassword")}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label={showCurrent ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            {showCurrent ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-destructive text-sm">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* 새 비밀번호 */}
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">새 비밀번호</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            disabled={isPending}
            aria-invalid={!!errors.newPassword}
            className="pr-10"
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label={showNew ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            {showNew ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* 비밀번호 복잡도 실시간 요구사항 목록 */}
        {newPasswordValue.length > 0 && (
          <ul className="mt-2 space-y-1">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const passed = req.test(newPasswordValue);
              return (
                <li key={req.key} className="flex items-center gap-1.5">
                  {passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" />
                  ) : (
                    <XCircle className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                  >
                    {req.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 새 비밀번호 확인 */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            disabled={isPending}
            aria-invalid={passwordsMismatch}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label={showConfirm ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPasswordValue.length > 0 && (
          <p
            className={`flex items-center gap-1 text-sm ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
          >
            {passwordsMatch ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                비밀번호가 일치합니다
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                비밀번호가 일치하지 않습니다
              </>
            )}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            변경 중...
          </>
        ) : (
          "비밀번호 변경"
        )}
      </Button>
    </form>
  );
}
