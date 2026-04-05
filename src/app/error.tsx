"use client";

import { Container } from "@/components/layout/container";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container size="sm" className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">오류가 발생했습니다</h1>
          <p className="text-muted-foreground">
            견적서를 불러오는 중 문제가 발생했습니다.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">
              오류 코드: {error.digest}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          잠시 후 다시 시도하거나, 견적서를 발송한 담당자에게 문의해 주세요.
        </p>
        <button
          onClick={reset}
          className="inline-block text-sm font-medium underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          다시 시도
        </button>
      </Container>
    </main>
  );
}
