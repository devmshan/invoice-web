import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Quote } from "@/lib/types";
import { PdfDownloadButton } from "./_components/pdf-download-button";

interface QuotePageProps {
  params: Promise<{ pageId: string }>;
}

export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const { pageId } = await params;
  return {
    title: `견적서 | Invoice Web`,
    description: `견적서 ID: ${pageId}`,
  };
}

// TODO: Notion API 연동 후 실제 데이터 조회로 교체
async function getQuote(pageId: string): Promise<Quote | null> {
  // 구현 예정: notion.pages.retrieve({ page_id: pageId })
  void pageId;
  return null;
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { pageId } = await params;
  const quote = await getQuote(pageId);

  if (!quote) {
    notFound();
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const subtotal = quote.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <main className="min-h-screen bg-background py-10 print:py-0">
      <div className="mx-auto max-w-3xl px-4">
        {/* 만료 배너 */}
        {isExpired && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive print:hidden">
            이 견적서는 유효기간이 만료되었습니다. 발행자에게 문의해 주세요.
          </div>
        )}

        {/* 견적서 본문 */}
        <div className="rounded-lg border bg-card p-8 shadow-sm print:border-0 print:shadow-none">
          {/* 헤더: 제목 + 발행 정보 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{quote.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                견적서 번호: <span className="font-mono">{quote.id}</span>
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <p>발행일: {quote.issue_date}</p>
              <p>
                유효기간:{" "}
                <span
                  className={isExpired ? "text-destructive font-medium" : ""}
                >
                  {quote.valid_until}
                </span>
              </p>
            </div>
          </div>

          <div className="my-6 border-t" />

          {/* 발행자 / 수신자 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                발행자
              </p>
              <p className="font-semibold">{quote.issuer_name}</p>
              <p className="text-sm text-muted-foreground">
                {quote.issuer_contact}
              </p>
              <p className="text-sm text-muted-foreground">
                {quote.issuer_email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                수신자
              </p>
              <p className="font-semibold">{quote.client_name}</p>
              <p className="text-sm text-muted-foreground">
                {quote.client_company}
              </p>
            </div>
          </div>

          <div className="my-6 border-t" />

          {/* 견적 항목 테이블 */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">항목</th>
                <th className="pb-2 text-right font-medium">수량</th>
                <th className="pb-2 text-right font-medium">단가</th>
                <th className="pb-2 text-right font-medium">소계</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3">{item.item_name}</td>
                  <td className="py-3 text-right">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    {item.unit_price.toLocaleString()}원
                  </td>
                  <td className="py-3 text-right">
                    {(item.quantity * item.unit_price).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="my-6 border-t" />

          {/* 금액 합산 */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">소계</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">세금 (10%)</span>
                <span>{tax.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>합계</span>
                <span>{total.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 메모 */}
          {quote.note && (
            <>
              <div className="my-6 border-t" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  메모
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.note}
                </p>
              </div>
            </>
          )}
        </div>

        {/* PDF 다운로드 버튼 */}
        <div className="mt-6 flex justify-end print:hidden">
          <PdfDownloadButton />
        </div>
      </div>
    </main>
  );
}
