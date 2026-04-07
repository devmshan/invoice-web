"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { pageIdSchema } from "@/lib/schemas/quote";
import { getQuoteAdmin, updateQuoteStatus } from "@/lib/notion";
import { auditLogger } from "@/lib/logger";
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
