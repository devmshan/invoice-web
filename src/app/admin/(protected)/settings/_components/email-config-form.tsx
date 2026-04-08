"use client";

import { useActionState, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { saveEmailConfig, sendTestEmail } from "../actions";
import type { EmailConfig } from "@/lib/kv";

// 이메일 설정 폼 스키마 (클라이언트 검증용)
const emailConfigFormSchema = z.object({
  fromEmail: z.string().min(1, "발신 이메일을 입력해 주세요."),
  subjectTemplate: z.string().min(1, "제목 템플릿을 입력해 주세요."),
  bodyNote: z.string(),
});

type EmailConfigFormValues = z.infer<typeof emailConfigFormSchema>;

// 템플릿 변수 치환 함수 (미리보기용)
function replaceTemplateVars(template: string): string {
  return template
    .replace(/\{\{quote_title\}\}/g, "견적서 #2024-001")
    .replace(/\{\{client_name\}\}/g, "홍길동")
    .replace(/\{\{quote_url\}\}/g, "https://example.com/quote/abc123");
}

interface EmailConfigFormProps {
  // 현재 저장된 이메일 설정 (서버에서 조회)
  initialConfig: EmailConfig;
}

/**
 * 이메일 발송 설정 폼 컴포넌트
 * - 발신 이메일 주소 설정
 * - 이메일 제목 템플릿 ({{quote_title}} 변수 지원)
 * - 추가 본문 문구 (선택)
 * - 템플릿 미리보기
 * - 테스트 이메일 발송
 */
export function EmailConfigForm({ initialConfig }: EmailConfigFormProps) {
  const [saveState, saveAction, isSavePending] = useActionState(
    saveEmailConfig,
    undefined,
  );
  const [testState, testAction, isTestPending] = useActionState(
    sendTestEmail,
    undefined,
  );
  const [testEmail, setTestEmail] = useState("");

  const {
    register,
    control,
    formState: { errors },
  } = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigFormSchema),
    defaultValues: {
      fromEmail: initialConfig.fromEmail,
      subjectTemplate: initialConfig.subjectTemplate,
      bodyNote: initialConfig.bodyNote,
    },
    mode: "onChange",
  });

  // 실시간 값 감시 (미리보기용)
  const subjectValue = useWatch({
    control,
    name: "subjectTemplate",
    defaultValue: initialConfig.subjectTemplate,
  });

  // 저장 성공 toast
  if (saveState && "success" in saveState && saveState.success) {
    toast.success("이메일 설정이 저장되었습니다.");
  }

  // 테스트 이메일 성공 toast
  if (testState && "success" in testState && testState.success) {
    toast.success("테스트 이메일이 발송되었습니다.");
  }

  return (
    <div className="space-y-8">
      {/* 이메일 발송 설정 폼 */}
      <form action={saveAction} className="max-w-lg space-y-5">
        {saveState && "error" in saveState && saveState.error && (
          <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
            {saveState.error}
          </div>
        )}

        {/* 발신 이메일 */}
        <div className="space-y-1.5">
          <Label htmlFor="fromEmail">발신 이메일 주소</Label>
          <Input
            id="fromEmail"
            type="text"
            placeholder="onboarding@resend.dev"
            disabled={isSavePending}
            aria-invalid={!!errors.fromEmail}
            {...register("fromEmail")}
          />
          <p className="text-muted-foreground text-xs">
            예: <code>noreply@example.com</code> 또는{" "}
            <code>Invoiced &lt;noreply@example.com&gt;</code>
          </p>
          {errors.fromEmail && (
            <p className="text-destructive text-sm">
              {errors.fromEmail.message}
            </p>
          )}
        </div>

        {/* 이메일 제목 템플릿 */}
        <div className="space-y-1.5">
          <Label htmlFor="subjectTemplate">이메일 제목 템플릿</Label>
          <Input
            id="subjectTemplate"
            type="text"
            placeholder="[견적서] {{quote_title}}"
            disabled={isSavePending}
            aria-invalid={!!errors.subjectTemplate}
            {...register("subjectTemplate")}
          />
          <p className="text-muted-foreground text-xs">
            사용 가능 변수: <code>{"{{quote_title}}"}</code>
          </p>

          {/* 제목 미리보기 */}
          {subjectValue && (
            <div className="bg-muted/50 rounded-md border px-3 py-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                미리보기
              </p>
              <p className="text-sm">{replaceTemplateVars(subjectValue)}</p>
            </div>
          )}
          {errors.subjectTemplate && (
            <p className="text-destructive text-sm">
              {errors.subjectTemplate.message}
            </p>
          )}
        </div>

        {/* 추가 본문 문구 */}
        <div className="space-y-1.5">
          <Label htmlFor="bodyNote">추가 본문 문구 (선택)</Label>
          <Textarea
            id="bodyNote"
            placeholder="이메일 본문에 추가할 문구를 입력하세요."
            rows={3}
            disabled={isSavePending}
            {...register("bodyNote")}
          />
          <p className="text-muted-foreground text-xs">
            사용 가능 변수: <code>{"{{client_name}}"}</code>,{" "}
            <code>{"{{quote_title}}"}</code>, <code>{"{{quote_url}}"}</code>
          </p>
        </div>

        <Button type="submit" disabled={isSavePending}>
          {isSavePending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "설정 저장"
          )}
        </Button>
      </form>

      <Separator />

      {/* 테스트 이메일 발송 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">테스트 이메일 발송</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            현재 설정으로 테스트 이메일을 발송하여 정상 작동 여부를 확인합니다.
          </p>
        </div>

        <form action={testAction} className="flex max-w-lg gap-2">
          {testState && "error" in testState && testState.error && (
            <div className="bg-destructive/10 text-destructive w-full rounded-md px-4 py-3 text-sm">
              {testState.error}
            </div>
          )}
          <Input
            name="toEmail"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isTestPending}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isTestPending || !testEmail}
          >
            {isTestPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                발송
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
