import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { getQuoteList } from "@/lib/notion";
import type { QuoteStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { QuoteStatusBadge } from "./_components/quote-status-badge";
import { SearchInput } from "./_components/search-input";

// 상태 필터 탭 목록
const STATUS_TABS: { label: string; value: QuoteStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "초안", value: "draft" },
  { label: "발송됨", value: "sent" },
  { label: "수락됨", value: "accepted" },
  { label: "거절됨", value: "rejected" },
];

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function QuotesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, q } = await searchParams;

  // 유효한 상태값만 필터로 사용
  const validStatuses: QuoteStatus[] = [
    "draft",
    "sent",
    "accepted",
    "rejected",
  ];
  const currentStatus = validStatuses.includes(status as QuoteStatus)
    ? (status as QuoteStatus)
    : undefined;

  const quotes = await getQuoteList({ status: currentStatus });

  // 검색어가 있는 경우 클라이언트 사이드 필터링 적용
  const filtered = q
    ? quotes.filter(
        (quote) =>
          quote.title.toLowerCase().includes(q.toLowerCase()) ||
          quote.client_name.toLowerCase().includes(q.toLowerCase()) ||
          quote.client_company.toLowerCase().includes(q.toLowerCase()),
      )
    : quotes;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">견적서 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          총 {filtered.length}개의 견적서
        </p>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => {
          const params = new URLSearchParams();
          if (tab.value !== "all") params.set("status", tab.value);
          if (q) params.set("q", q);
          const isActive =
            tab.value === "all" ? !currentStatus : currentStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/quotes?${params.toString()}`}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 검색 입력 (useSearchParams 사용으로 Suspense 필요) */}
      <div className="max-w-sm">
        <Suspense>
          <SearchInput defaultValue={q} />
        </Suspense>
      </div>

      {/* 견적서 목록 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>수신자</TableHead>
              <TableHead>발행일</TableHead>
              <TableHead>유효기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center"
                >
                  견적서가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.title}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{quote.client_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {quote.client_company}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {quote.issue_date}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {quote.valid_until}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                      )}
                    >
                      상세보기
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
