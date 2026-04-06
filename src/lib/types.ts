export type QuoteItem = {
  item_name: string;
  quantity: number;
  unit_price: number;
};

export type QuoteStatus = "pending" | "accepted" | "rejected";

export type Quote = {
  id: string; // 노션 페이지 ID
  title: string;
  issue_date: string;
  valid_until: string;
  issuer_name: string;
  issuer_contact: string;
  issuer_email: string;
  client_name: string;
  client_company: string;
  note: string;
  status: QuoteStatus;
  items: QuoteItem[];
};

export type QuoteError = "NOT_FOUND" | "EXPIRED" | "API_ERROR" | "UNAUTHORIZED";
