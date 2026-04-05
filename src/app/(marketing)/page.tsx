import { FileText, Link2, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

const features = [
  {
    icon: FileText,
    title: "노션 기반 견적서",
    description:
      "노션에 입력한 견적 데이터를 Notion API로 실시간 조회하여 웹 견적서로 렌더링합니다.",
  },
  {
    icon: Link2,
    title: "고유 URL 공유",
    description:
      "각 견적서마다 고유한 URL을 생성하여 클라이언트가 별도 로그인 없이 바로 확인할 수 있습니다.",
  },
  {
    icon: Download,
    title: "PDF 다운로드",
    description:
      "웹에서 확인한 견적서를 PDF 파일로 바로 저장할 수 있어 제출·보관이 간편합니다.",
  },
];

export default function HomePage() {
  return (
    <Container>
      <Section className="flex flex-col items-center text-center gap-6 pb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          노션 견적서를 <span className="text-primary">웹으로 공유</span>
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          프리랜서와 1인 업체를 위한 견적서 공유 서비스입니다. 노션에 작성한
          견적서를 고유 링크로 고객에게 전달하고, PDF로 저장하세요.
        </p>
      </Section>

      <Section
        title="주요 기능"
        description="간단하고 빠른 견적서 공유 워크플로우"
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </Section>
    </Container>
  );
}
