import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/layout/container";

// 사이트 푸터 컴포넌트
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <Separator />
      <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Invoice Web. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Built with{" "}
          <span className="font-medium text-foreground">Next.js</span>,{" "}
          <span className="font-medium text-foreground">Tailwind CSS v4</span>,{" "}
          <span className="font-medium text-foreground">shadcn/ui</span>
        </p>
      </Container>
    </footer>
  );
}
