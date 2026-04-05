import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

// 일관된 수직 간격을 제공하는 페이지 섹션 래퍼
export function Section({
  children,
  title,
  description,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      {(title || description) && (
        <div className="mb-12 text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground mt-4 text-lg">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
