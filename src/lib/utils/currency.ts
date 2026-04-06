import type { QuoteItem } from "@/lib/types";

export function formatKRW(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

export function calcQuoteTotals(items: QuoteItem[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
