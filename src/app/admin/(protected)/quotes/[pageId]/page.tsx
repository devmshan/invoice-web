import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";
import { getQuoteAdmin } from "@/lib/notion";
import { calcQuoteTotals } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteHeader } from "@/app/quote/[pageId]/_components/quote-header";
import { QuoteParties } from "@/app/quote/[pageId]/_components/quote-parties";
import { QuoteItemsTable } from "@/app/quote/[pageId]/_components/quote-items-table";
import { QuoteSummary } from "@/app/quote/[pageId]/_components/quote-summary";
import { StatusChangeForm } from "./_components/status-change-form";
import { QuoteActions } from "./_components/quote-actions";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function AdminQuoteDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { pageId } = await params;

  // Notion API로 견적서 조회 (관리자 전용, draft 포함 모든 상태 허용)
  let quote;
  try {
    quote = await getQuoteAdmin(pageId);
  } catch {
    notFound();
  }

  // 유효기간 만료 여부 확인
  const isExpired = new Date(quote.valid_until) < new Date();
  const totals = calcQuoteTotals(quote.items);

  return (
    <div className="space-y-6">
      {/* 목록으로 돌아가기 */}
      <Link
        href="/admin/quotes"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2",
        )}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        견적서 목록
      </Link>

      {/* 견적서 뷰 (기존 공개 견적서 컴포넌트 재활용) */}
      <div className="bg-card space-y-8 rounded-lg border p-6 sm:p-8">
        <QuoteHeader
          title={quote.title}
          id={quote.id}
          issueDate={quote.issue_date}
          validUntil={quote.valid_until}
          isExpired={isExpired}
        />
        <QuoteParties
          issuerName={quote.issuer_name}
          issuerContact={quote.issuer_contact}
          issuerEmail={quote.issuer_email}
          clientName={quote.client_name}
          clientCompany={quote.client_company}
        />
        <QuoteItemsTable items={quote.items} />
        <QuoteSummary
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
        />
        {quote.note && (
          <div className="bg-muted/30 rounded-md border p-4">
            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-widest">
              비고
            </p>
            <p className="whitespace-pre-wrap text-sm">{quote.note}</p>
          </div>
        )}
      </div>

      {/* 관리자 액션 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">관리자 액션</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          {/* 상태 변경 폼 (실제 Notion API 연동) */}
          <StatusChangeForm pageId={pageId} currentStatus={quote.status} />

          {/* 이메일 발송 + 링크 복사 콤보 버튼 */}
          <QuoteActions
            pageId={pageId}
            status={quote.status}
            quoteTitle={quote.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}
