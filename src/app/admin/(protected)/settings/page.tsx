import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEmailConfig } from "@/lib/kv";
import { ChangePasswordForm } from "./_components/change-password-form";
import { EmailConfigForm } from "./_components/email-config-form";

export const metadata: Metadata = {
  title: "설정 | Invoice Admin",
};

export default async function SettingsPage() {
  // 관리자 인증 확인
  const admin = await requireAdmin();

  // 현재 이메일 설정 조회
  const emailConfig = await getEmailConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">설정</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          계정 정보를 관리합니다.
        </p>
      </div>

      {/* 계정 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 정보</CardTitle>
          <CardDescription>현재 로그인된 관리자 계정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium">이메일</p>
            <p className="text-muted-foreground text-sm">{admin.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">비밀번호 변경</CardTitle>
          <CardDescription>
            비밀번호 변경 후 자동으로 로그아웃되며 다시 로그인해야 합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* 이메일 발송 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">이메일 발송 설정</CardTitle>
          <CardDescription>
            견적서 이메일 발송 시 사용할 발신 주소 및 템플릿을 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailConfigForm initialConfig={emailConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
