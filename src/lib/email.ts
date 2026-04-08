import { Resend } from "resend";
import { env } from "@/lib/env";

// Resend 클라이언트 (RESEND_API_KEY가 없으면 null)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// 이메일 발송자 주소 (개발 환경은 onboarding@resend.dev 사용)
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Invoiced <onboarding@resend.dev>";

export interface SendQuoteEmailParams {
  // 수신자 이메일
  toEmail: string;
  // 수신자 이름
  clientName: string;
  // 견적서 제목
  quoteTitle: string;
  // 견적서 공개 URL
  quoteUrl: string;
}

export interface SendQuoteEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 수신자에게 견적서 링크 이메일 발송
 */
export async function sendQuoteEmail(
  params: SendQuoteEmailParams,
): Promise<SendQuoteEmailResult> {
  if (!resend) {
    return {
      success: false,
      error: "이메일 서비스가 설정되지 않았습니다. (RESEND_API_KEY 미설정)",
    };
  }

  const { toEmail, clientName, quoteTitle, quoteUrl } = params;

  const htmlContent = buildEmailHtml({ clientName, quoteTitle, quoteUrl });
  const textContent = buildEmailText({ clientName, quoteTitle, quoteUrl });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `[견적서] ${quoteTitle}`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return { success: false, error: message };
  }
}

// 이메일 HTML 템플릿 생성
function buildEmailHtml(params: {
  clientName: string;
  quoteTitle: string;
  quoteUrl: string;
}): string {
  const { clientName, quoteTitle, quoteUrl } = params;
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${quoteTitle} 견적서</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- 헤더 -->
    <div style="background: #1a1a1a; padding: 32px 40px;">
      <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">견적서가 도착했습니다</p>
    </div>

    <!-- 본문 -->
    <div style="padding: 40px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">${clientName}님 안녕하세요,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
        아래 버튼을 클릭하여 <strong>${quoteTitle}</strong> 견적서를 확인해 주세요.
      </p>

      <!-- CTA 버튼 -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${quoteUrl}"
          style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          견적서 확인하기
        </a>
      </div>

      <!-- URL 직접 표시 -->
      <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; text-align: center;">
        버튼이 작동하지 않으면 아래 주소를 복사해 주세요:<br />
        <a href="${quoteUrl}" style="color: #6b7280; word-break: break-all;">${quoteUrl}</a>
      </p>
    </div>

    <!-- 푸터 -->
    <div style="border-top: 1px solid #f3f4f6; padding: 24px 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
        이 이메일은 자동으로 발송되었습니다.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// 이메일 평문 텍스트 템플릿 생성
function buildEmailText(params: {
  clientName: string;
  quoteTitle: string;
  quoteUrl: string;
}): string {
  const { clientName, quoteTitle, quoteUrl } = params;
  return [
    `${clientName}님 안녕하세요,`,
    "",
    `${quoteTitle} 견적서가 발송되었습니다.`,
    "",
    `견적서 확인하기: ${quoteUrl}`,
    "",
    "이 이메일은 자동으로 발송되었습니다.",
  ].join("\n");
}
