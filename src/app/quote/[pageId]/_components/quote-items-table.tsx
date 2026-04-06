import type { QuoteItem } from "@/lib/types";
import { formatKRW } from "@/lib/utils/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuoteItemsTableProps {
  items: QuoteItem[];
}

export function QuoteItemsTable({ items }: QuoteItemsTableProps) {
  return (
    /* 모바일 스크롤을 위한 래퍼 */
    <div className="-mx-1 overflow-x-auto">
      <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[45%] font-semibold text-foreground">
              항목
            </TableHead>
            <TableHead className="w-[15%] text-right font-semibold text-foreground">
              수량
            </TableHead>
            <TableHead className="w-[20%] text-right font-semibold text-foreground">
              단가
            </TableHead>
            <TableHead className="w-[20%] text-right font-semibold text-foreground">
              소계
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/20">
              {/* 항목명 */}
              <TableCell className="py-3.5">
                <p className="font-medium">{item.item_name}</p>
              </TableCell>
              <TableCell className="py-3.5 text-right tabular-nums">
                {item.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="py-3.5 text-right tabular-nums">
                {formatKRW(item.unit_price)}
              </TableCell>
              <TableCell className="py-3.5 text-right font-medium tabular-nums">
                {formatKRW(item.quantity * item.unit_price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
