import { formatKRW } from "@/lib/utils/currency";
import { Separator } from "@/components/ui/separator";

interface QuoteSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

export function QuoteSummary({ subtotal, tax, total }: QuoteSummaryProps) {
  return (
    <div className="flex justify-end">
      {/* 모바일에서는 전체 폭, sm 이상에서는 고정폭 */}
      <div className="w-full space-y-2.5 text-sm sm:w-72">
        {/* 소계 행 */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">소계</span>
          <span className="tabular-nums">{formatKRW(subtotal)}</span>
        </div>

        {/* 세금 행 */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">부가세 (10%)</span>
          <span className="tabular-nums">{formatKRW(tax)}</span>
        </div>

        <Separator />

        {/* 합계 행: 시각적으로 강조 */}
        <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2.5 print:bg-transparent print:px-0 print:py-2">
          <span className="font-semibold">최종 합계</span>
          <span className="text-lg font-bold tabular-nums">
            {formatKRW(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
