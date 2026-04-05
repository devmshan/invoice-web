import { cn } from "@/lib/utils";

// 컨테이너 크기 변형
const sizeVariants = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
};

interface ContainerProps {
  children: React.ReactNode;
  size?: keyof typeof sizeVariants;
  className?: string;
}

// 일관된 max-width 및 수평 패딩을 제공하는 래퍼 컴포넌트
export function Container({
  children,
  size = "lg",
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        sizeVariants[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
