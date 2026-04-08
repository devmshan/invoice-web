"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { pageIdSchema } from "@/lib/schemas/quote";
import { getQuoteAdmin, updateQuoteStatus } from "@/lib/notion";
import { auditLogger } from "@/lib/logger";
import { sendQuoteEmail } from "@/lib/email";
import { env } from "@/lib/env";
import type { QuoteStatus } from "@/lib/types";

const statusSchema = z.enum(["draft", "sent", "accepted", "rejected"]);

export async function changeQuoteStatus(
  pageId: string,
  newStatus: QuoteStatus,
): Promise<{ success: true } | { error: string }> {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  // 페이지 ID 유효성 검사
  const pageIdResult = pageIdSchema.safeParse(pageId);
  if (!pageIdResult.success) {
    return { error: "유효하지 않은 페이지 ID입니다." };
  }

  // 상태값 유효성 검사
  const statusResult = statusSchema.safeParse(newStatus);
  if (!statusResult.success) {
    return { error: "유효하지 않은 상태값입니다." };
  }

  // 현재 상태 조회 (감사 로그에 기록하기 위해)
  let fromStatus: QuoteStatus | undefined;
  try {
    const current = await getQuoteAdmin(pageId);
    fromStatus = current.status;
  } catch {
    return { error: "견적서를 찾을 수 없습니다." };
  }

  // 상태 업데이트
  try {
    await updateQuoteStatus(pageId, newStatus);
  } catch {
    return { error: "상태 변경에 실패했습니다." };
  }

  // 관련 경로 캐시 무효화
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${pageId}`);
  revalidatePath(`/quote/${pageId}`);

  // 감사 로그 기록
  auditLogger.info(
    { pageId, from: fromStatus, to: newStatus, admin: admin.email },
    "quote status changed",
  );

  return { success: true };
}

// 이메일 발송 파라미터 스키마
const sendEmailSchema = z.object({
  toEmail: z.string().email("유효한 이메일 주소를 입력해 주세요."),
});

/**
 * 견적서 이메일 발송 Server Action
 * - 관리자 인증 확인
 * - 수신자 이메일 Zod 검증
 * - Resend API로 이메일 발송
 * - draft 상태인 경우 발송 후 자동으로 sent 상태로 변경
 * - auditLogger로 이메일 발송 감사 로그 기록
 */
export async function sendQuoteEmailAction(
  pageId: string,
  toEmail: string,
): Promise<{ success: true; autoStatusChanged?: boolean } | { error: string }> {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  // 페이지 ID 유효성 검사
  const pageIdResult = pageIdSchema.safeParse(pageId);
  if (!pageIdResult.success) {
    return { error: "유효하지 않은 페이지 ID입니다." };
  }

  // 수신자 이메일 유효성 검사
  const emailResult = sendEmailSchema.safeParse({ toEmail });
  if (!emailResult.success) {
    return {
      error:
        emailResult.error.issues[0]?.message ??
        "이메일 형식이 올바르지 않습니다.",
    };
  }

  // 견적서 조회
  let quote;
  try {
    quote = await getQuoteAdmin(pageId);
  } catch {
    return { error: "견적서를 찾을 수 없습니다." };
  }

  // 견적서 공개 URL 생성
  const baseUrl = env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const quoteUrl = `${baseUrl}/quote/${pageId}`;

  // 이메일 발송
  const result = await sendQuoteEmail({
    toEmail,
    clientName: quote.client_name || "고객",
    quoteTitle: quote.title,
    quoteUrl,
  });

  if (!result.success) {
    return { error: result.error ?? "이메일 발송에 실패했습니다." };
  }

  // draft 상태인 경우 자동으로 sent로 변경
  let autoStatusChanged = false;
  if (quote.status === "draft") {
    try {
      await updateQuoteStatus(pageId, "sent");
      autoStatusChanged = true;
      revalidatePath("/admin/quotes");
      revalidatePath(`/admin/quotes/${pageId}`);
      revalidatePath(`/quote/${pageId}`);
    } catch {
      // 상태 변경 실패는 이메일 발송 성공과 별개로 처리
      auditLogger.warn(
        { pageId, admin: admin.email },
        "email sent but auto status change to sent failed",
      );
    }
  }

  // 감사 로그 기록
  auditLogger.info(
    {
      pageId,
      toEmail,
      admin: admin.email,
      messageId: result.messageId,
      autoStatusChanged,
    },
    "quote email sent",
  );

  return { success: true, autoStatusChanged };
}
