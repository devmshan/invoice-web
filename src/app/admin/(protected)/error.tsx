"use client";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// 관리자 영역 에러 바운더리 (클라이언트 컴포넌트 필수)
export default function AdminError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <h2 className="text-2xl font-bold">오류가 발생했습니다</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
