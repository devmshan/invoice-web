import { Loader2 } from "lucide-react";

import { Container } from "@/components/layout/container";

export default function QuoteLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container size="sm" className="space-y-4 text-center">
        <Loader2 className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          견적서를 불러오는 중입니다...
        </p>
      </Container>
    </main>
  );
}
