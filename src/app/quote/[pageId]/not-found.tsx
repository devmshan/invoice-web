import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function QuoteNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container size="sm" className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">견적서를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            존재하지 않는 견적서 ID이거나, 잘못된 URL입니다.
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          견적서 URL을 다시 확인하거나, 견적서를 발송한 담당자에게 문의해
          주세요.
        </p>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-block text-sm font-medium underline underline-offset-4"
        >
          홈으로 돌아가기
        </Link>
      </Container>
    </main>
  );
}
