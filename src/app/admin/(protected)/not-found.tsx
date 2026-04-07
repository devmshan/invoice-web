import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

// 관리자 영역 404 페이지
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <h2 className="text-2xl font-bold">404 — 페이지를 찾을 수 없습니다</h2>
      <p className="text-muted-foreground">
        요청하신 페이지가 존재하지 않습니다.
      </p>
      <Link
        href="/admin/quotes"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        견적서 목록으로
      </Link>
    </div>
  );
}
