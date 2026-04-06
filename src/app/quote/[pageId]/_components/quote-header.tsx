import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuoteHeaderProps {
  title: string;
  id: string;
  issueDate: string;
  validUntil: string;
  isExpired: boolean;
}

export function QuoteHeader({
  title,
  id,
  issueDate,
  validUntil,
  isExpired,
}: QuoteHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 문서 타입 레이블 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
          견적서
        </span>
        <Separator orientation="vertical" className="h-3" />
        {isExpired ? (
          <Badge variant="destructive" className="text-xs">
            만료됨
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          >
            유효
          </Badge>
        )}
      </div>

      {/* 제목과 날짜 정보 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* 좌측: 제목 및 번호 */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1.5 font-mono text-xs">
            No. {id}
          </p>
        </div>

        {/* 우측: 날짜 정보 테이블 */}
        <div className="shrink-0 rounded-md border bg-muted/30 px-4 py-3 print:border-border">
          <dl className="space-y-1.5">
            <div className="flex items-center gap-6 text-sm">
              <dt className="text-muted-foreground w-16 shrink-0 text-xs font-medium">
                발행일
              </dt>
              <dd className="font-medium tabular-nums">{issueDate}</dd>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <dt className="text-muted-foreground w-16 shrink-0 text-xs font-medium">
                유효기간
              </dt>
              <dd
                className={
                  isExpired
                    ? "font-medium tabular-nums text-destructive"
                    : "font-medium tabular-nums"
                }
              >
                {validUntil}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
