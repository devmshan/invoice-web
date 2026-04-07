import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuote } from "@/lib/notion";
import { pageIdSchema } from "@/lib/schemas/quote";
import { calcQuoteTotals } from "@/lib/utils/currency";
import { PdfDownloadButton } from "./_components/pdf-download-button";
import { QuoteHeader } from "./_components/quote-header";
import { QuoteParties } from "./_components/quote-parties";
import { QuoteItemsTable } from "./_components/quote-items-table";
import { QuoteSummary } from "./_components/quote-summary";

interface QuotePageProps {
  params: Promise<{ pageId: string }>;
}

export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const { pageId } = await params;
  if (!pageIdSchema.safeParse(pageId).success) {
    return { title: `견적서 | Invoice Web` };
  }
  const result = await getQuote(pageId);
  if ("error" in result) {
    if (result.error === "DRAFT_ACCESS_DENIED") {
      return { title: `견적서 | Invoice Web` };
    }
    return { title: `견적서 | Invoice Web` };
  }
  return {
    title: `${result.data.title} | Invoice Web`,
    description: `${result.data.issuer_name}의 견적서`,
    openGraph: {
      title: `${result.data.title} | Invoice Web`,
      description: `${result.data.issuer_name}의 견적서`,
      type: "website",
    },
  };
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { pageId } = await params;
  if (!pageIdSchema.safeParse(pageId).success) {
    notFound();
  }
  const result = await getQuote(pageId);

  if ("error" in result) {
    if (result.error === "NOT_FOUND") {
      notFound();
    }
    if (result.error === "DRAFT_ACCESS_DENIED") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30">
          <div className="mx-auto max-w-md px-4 text-center">
            <h1 className="mb-3 text-xl font-semibold">
              견적서를 확인할 수 없습니다
            </h1>
            <p className="text-muted-foreground text-sm">
              아직 공개되지 않은 견적서입니다. 발행자에게 문의해 주세요.
            </p>
          </div>
        </main>
      );
    }
    throw new Error(`견적서를 불러올 수 없습니다. (${result.error})`);
  }

  const quote = result.data;
  const isExpired = new Date(quote.valid_until) < new Date();
  const { subtotal, tax, total } = calcQuoteTotals(quote.items);

  return (
    /* 인쇄 시: 여백 제거, 배경색 제거 */
    <main className="min-h-screen bg-muted/30 py-8 print:min-h-0 print:bg-transparent print:py-0 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 print:px-0">
        {/* 만료 배너: 인쇄 시 숨김 */}
        {isExpired && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive print:hidden"
          >
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>
              이 견적서는 유효기간이 만료되었습니다. 발행자에게 문의해 주세요.
            </span>
          </div>
        )}

        {/* 견적서 본문 카드: 인쇄 시 테두리/그림자 제거 */}
        <div className="rounded-lg border bg-card shadow-sm print:rounded-none print:border-0 print:shadow-none">
          {/* 상단 패딩 영역 */}
          <div className="p-6 sm:p-8">
            <QuoteHeader
              title={quote.title}
              id={quote.id}
              issueDate={quote.issue_date}
              validUntil={quote.valid_until}
              isExpired={isExpired}
            />
          </div>

          <div className="border-t" />

          <div className="p-6 sm:p-8">
            <QuoteParties
              issuerName={quote.issuer_name}
              issuerContact={quote.issuer_contact}
              issuerEmail={quote.issuer_email}
              clientName={quote.client_name}
              clientCompany={quote.client_company}
            />
          </div>

          <div className="border-t" />

          {/* 테이블 섹션: 좌우 패딩 포함 */}
          <div className="px-6 py-6 sm:px-8">
            <QuoteItemsTable items={quote.items} />
          </div>

          <div className="border-t" />

          <div className="p-6 sm:p-8">
            <QuoteSummary subtotal={subtotal} tax={tax} total={total} />
          </div>

          {/* 메모 섹션: 내용 있을 때만 표시 */}
          {quote.note && (
            <>
              <div className="border-t" />
              <div className="p-6 sm:p-8">
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-widest">
                  메모
                </p>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {quote.note}
                </p>
              </div>
            </>
          )}
        </div>

        {/* PDF 다운로드 버튼: 인쇄 시 숨김 */}
        <div className="mt-5 flex items-center justify-between print:hidden">
          {/* 좌측 안내 문구 */}
          <p className="text-muted-foreground text-xs">
            브라우저의 인쇄 기능으로도 PDF를 저장할 수 있습니다.
          </p>
          <PdfDownloadButton />
        </div>
      </div>
    </main>
  );
}
