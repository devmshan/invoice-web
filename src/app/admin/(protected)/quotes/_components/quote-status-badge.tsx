import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@/lib/types";

// 상태별 배지 설정 (label, variant, className)
const statusConfig: Record<
  QuoteStatus,
  {
    label: string;
    variant: "secondary" | "default" | "outline" | "destructive";
    className: string;
  }
> = {
  draft: { label: "초안", variant: "secondary", className: "" },
  sent: {
    label: "발송됨",
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  accepted: {
    label: "수락됨",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  rejected: { label: "거절됨", variant: "destructive", className: "" },
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
