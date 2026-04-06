"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfDownloadButton() {
  const [isPrinting, setIsPrinting] = useState(false);

  function handlePrint() {
    setIsPrinting(true);
    // 인쇄 다이얼로그가 열릴 시간을 확보한 후 상태 복원
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  }

  return (
    <Button
      variant="default"
      onClick={handlePrint}
      disabled={isPrinting}
      className="gap-2 shadow-sm"
      aria-label="견적서를 PDF로 다운로드"
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      PDF 다운로드
    </Button>
  );
}
