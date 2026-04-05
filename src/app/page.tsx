import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center py-20">
        <Container size="md" className="text-center space-y-8">
          {/* 서비스 타이틀 */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Invoice Web
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl">
              노션 견적서를 고유 URL로 공유하고 PDF로 다운로드하는 서비스
            </p>
          </div>

          <Separator className="mx-auto max-w-xs" />

          {/* 서비스 흐름 설명 */}
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">1</div>
              <h2 className="font-semibold">노션에 입력</h2>
              <p className="text-muted-foreground text-sm">
                노션 데이터베이스에 견적서 항목(발행자 정보, 수신자 정보, 견적
                항목, 금액)을 입력합니다.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">2</div>
              <h2 className="font-semibold">URL 전달</h2>
              <p className="text-muted-foreground text-sm">
                생성된 고유 URL(
                <code className="font-mono text-xs">/quote/[pageId]</code>)을
                이메일이나 메신저로 고객에게 전달합니다.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">3</div>
              <h2 className="font-semibold">확인 및 다운로드</h2>
              <p className="text-muted-foreground text-sm">
                고객은 URL로 접속해 견적서를 확인하고 PDF로 다운로드합니다.
              </p>
            </div>
          </div>

          {/* 안내 문구 */}
          <p className="text-muted-foreground text-sm">
            발행자로부터 견적서 URL을 받으셨다면 해당 URL로 바로 접속하세요.
          </p>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
