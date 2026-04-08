import { kv } from "@vercel/kv";

export async function getAdminPasswordHash(): Promise<string | null> {
  return kv.get<string>("admin:password_hash");
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await kv.set("admin:password_hash", hash);
}

// 이메일 발송 설정 타입
export interface EmailConfig {
  // 발신자 이메일 주소 (예: "Invoiced <noreply@example.com>")
  fromEmail: string;
  // 이메일 제목 템플릿 ({{quote_title}} 변수 지원)
  subjectTemplate: string;
  // 이메일 본문 추가 문구 (선택)
  bodyNote: string;
}

// 이메일 설정 기본값
export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  fromEmail: "onboarding@resend.dev",
  subjectTemplate: "[견적서] {{quote_title}}",
  bodyNote: "",
};

export async function getEmailConfig(): Promise<EmailConfig> {
  const config = await kv.get<EmailConfig>("email:config");
  return config ?? DEFAULT_EMAIL_CONFIG;
}

export async function setEmailConfig(config: EmailConfig): Promise<void> {
  await kv.set("email:config", config);
}
