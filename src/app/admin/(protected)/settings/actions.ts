"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getAdminPasswordHash,
  setAdminPasswordHash,
  getEmailConfig,
  setEmailConfig,
} from "@/lib/kv";
import { verifyPassword, hashPassword, clearAuthCookie } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { securityLogger, auditLogger } from "@/lib/logger";
import { sendQuoteEmail } from "@/lib/email";

/**
 * 관리자 비밀번호 변경 Server Action
 * 1. requireAdmin() - 인증 확인
 * 2. 현재 비밀번호를 KV에서 해시 조회 후 bcrypt 검증
 * 3. 새 비밀번호 bcrypt 해싱 (SALT_ROUNDS=12)
 * 4. KV에 새 해시 저장 (모든 인스턴스에 즉시 반영)
 * 5. 쿠키 삭제 → /admin/login 리다이렉트 (재로그인 요구)
 */
export async function changePassword(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error: string }> {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  // 폼 데이터 파싱
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Zod 스키마 검증
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "입력값이 올바르지 않습니다." };
  }

  const { currentPassword, newPassword } = parsed.data;

  // KV에서 현재 비밀번호 해시 조회
  const currentHash = await getAdminPasswordHash();
  if (!currentHash) {
    securityLogger.warn(
      { admin: admin.email },
      "password change failed: no hash found in KV",
    );
    return {
      error: "비밀번호 정보를 찾을 수 없습니다. 관리자에게 문의하세요.",
    };
  }

  // 현재 비밀번호 검증
  const isValid = await verifyPassword(currentPassword, currentHash);
  if (!isValid) {
    securityLogger.warn(
      { admin: admin.email },
      "password change failed: incorrect current password",
    );
    return { error: "현재 비밀번호가 올바르지 않습니다." };
  }

  // 새 비밀번호가 현재와 같은지 확인
  const isSame = await verifyPassword(newPassword, currentHash);
  if (isSame) {
    return { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다." };
  }

  // 새 비밀번호 해싱 후 KV에 저장
  const newHash = await hashPassword(newPassword);
  await setAdminPasswordHash(newHash);

  // 보안 이벤트 로깅
  securityLogger.info(
    { admin: admin.email },
    "admin password changed successfully",
  );

  // 쿠키 삭제 후 로그인 페이지로 리다이렉트
  await clearAuthCookie();
  redirect("/admin/login?message=password_changed");
}

// 이메일 설정 저장 스키마
const emailConfigSchema = z.object({
  fromEmail: z
    .string()
    .min(1, "발신 이메일을 입력해 주세요.")
    .max(254, "이메일 주소가 너무 깁니다."),
  subjectTemplate: z
    .string()
    .min(1, "이메일 제목 템플릿을 입력해 주세요.")
    .max(200, "제목 템플릿은 200자 이내로 입력해 주세요."),
  bodyNote: z
    .string()
    .max(500, "추가 문구는 500자 이내로 입력해 주세요.")
    .default(""),
});

/**
 * 이메일 발송 설정 저장 Server Action
 */
export async function saveEmailConfig(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  const raw = {
    fromEmail: formData.get("fromEmail"),
    subjectTemplate: formData.get("subjectTemplate"),
    bodyNote: formData.get("bodyNote") ?? "",
  };

  const parsed = emailConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.",
    };
  }

  await setEmailConfig(parsed.data);

  auditLogger.info(
    { admin: admin.email, config: parsed.data },
    "email config saved",
  );

  return { success: true };
}

// 테스트 이메일 발송 스키마
const testEmailSchema = z.object({
  toEmail: z.string().email("유효한 이메일 주소를 입력해 주세요."),
});

/**
 * 테스트 이메일 발송 Server Action
 * - KV에 저장된 이메일 설정을 사용하여 테스트 이메일 발송
 */
export async function sendTestEmail(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  const raw = { toEmail: formData.get("toEmail") };
  const parsed = testEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "이메일 형식이 올바르지 않습니다.",
    };
  }

  // 현재 이메일 설정 조회
  const config = await getEmailConfig();

  // 테스트 이메일 발송
  const result = await sendQuoteEmail({
    toEmail: parsed.data.toEmail,
    clientName: "테스트 수신자",
    quoteTitle: "테스트 견적서",
    quoteUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/quote/test-id`,
  });

  if (!result.success) {
    return { error: result.error ?? "테스트 이메일 발송에 실패했습니다." };
  }

  auditLogger.info(
    { admin: admin.email, toEmail: parsed.data.toEmail, config },
    "test email sent",
  );

  return { success: true };
}
