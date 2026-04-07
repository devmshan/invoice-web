"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "../actions";
import { loginSchema } from "@/lib/schemas/auth";
import type { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LoginFormData = z.infer<typeof loginSchema>;

// 관리자 로그인 폼 — useActionState + React Hook Form 조합
export function LoginForm() {
  // useActionState: Server Action 상태 관리 (React 19 방식)
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // React Hook Form: 클라이언트 사이드 유효성 검사
  const {
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>관리자 로그인</CardTitle>
        <CardDescription>Invoice Admin에 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {/* form의 action 속성에 formAction 전달 (React 19 방식) */}
        <form action={formAction} className="flex flex-col gap-4">
          {/* 서버 액션 에러 메시지 표시 */}
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* isPending 시 버튼 비활성화 + 로딩 텍스트 */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
