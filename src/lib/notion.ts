import { Client, APIResponseError } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Quote, QuoteError, QuoteItem, QuoteStatus } from "@/lib/types";

const apiKey = process.env.NOTION_API_KEY;
const itemsDatabaseId = process.env.NOTION_ITEMS_DATABASE_ID;

if (!apiKey) {
  throw new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다.");
}
if (!itemsDatabaseId) {
  throw new Error(
    "NOTION_ITEMS_DATABASE_ID 환경변수가 설정되지 않았습니다.",
  );
}

const notion = new Client({ auth: apiKey });

function isFullPage(page: unknown): page is PageObjectResponse {
  return (
    typeof page === "object" &&
    page !== null &&
    "object" in page &&
    (page as { object: string }).object === "page" &&
    "properties" in page
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRichText(prop: any, fallback = ""): string {
  return prop?.rich_text?.[0]?.plain_text ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTitle(prop: any, fallback = ""): string {
  return prop?.title?.[0]?.plain_text ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDate(prop: any, fallback = ""): string {
  return prop?.date?.start ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSelect(prop: any, fallback = "pending"): string {
  return prop?.select?.name ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPhone(prop: any, fallback = ""): string {
  return prop?.phone_number ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEmail(prop: any, fallback = ""): string {
  return prop?.email ?? fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNumber(prop: any, fallback = 0): number {
  return prop?.number ?? fallback;
}

export async function getQuote(
  pageId: string,
): Promise<{ data: Quote } | { error: QuoteError }> {
  try {
    const [pageResponse, itemsResponse] = await Promise.all([
      notion.pages.retrieve({ page_id: pageId }),
      notion.databases.query({
        database_id: itemsDatabaseId!,
        filter: {
          property: "invoice",
          relation: { contains: pageId },
        },
        sorts: [{ property: "sort_order", direction: "ascending" }],
      }),
    ]);

    if (!isFullPage(pageResponse)) {
      return { error: "NOT_FOUND" };
    }

    const props = pageResponse.properties;

    const items: QuoteItem[] = itemsResponse.results
      .filter(isFullPage)
      .map((item) => {
        const p = item.properties;
        return {
          item_name: getTitle(p.title),
          quantity: getNumber(p.quantity),
          unit_price: getNumber(p.unit_price),
        };
      });

    const quote: Quote = {
      id: pageResponse.id,
      title: getTitle(props.title),
      issue_date: getDate(props.issue_date),
      valid_until: getDate(props.valid_until),
      issuer_name: getRichText(props.issuer_name),
      issuer_contact: getPhone(props.issuer_contact),
      issuer_email: getEmail(props.issuer_email),
      client_name: getRichText(props.client_name),
      client_company: getRichText(props.client_company),
      note: getRichText(props.note),
      status: getSelect(props.status) as QuoteStatus,
      items,
    };

    return { data: quote };
  } catch (e) {
    if (e instanceof APIResponseError) {
      if (e.status === 404) return { error: "NOT_FOUND" };
      if (e.status === 401) return { error: "UNAUTHORIZED" };
    }
    return { error: "API_ERROR" };
  }
}
