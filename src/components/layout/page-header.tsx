import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  // 우측 액션 영역 (버튼 등)
  actions?: React.ReactNode;
  className?: string;
}

// 페이지 상단 제목 + 설명 + 액션 버튼을 포함하는 헤더 컴포넌트
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
