"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// URL searchParams를 이용한 실시간 검색 입력 컴포넌트
export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
      <Input
        className="pl-8"
        placeholder="제목, 수신자 검색..."
        defaultValue={defaultValue}
        onChange={handleChange}
      />
    </div>
  );
}
