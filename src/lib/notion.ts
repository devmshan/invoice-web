import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Client, APIResponseError } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Quote, QuoteError, QuoteItem, QuoteStatus } from "@/lib/types";
import { logger } from "@/lib/logger";

const apiKey = process.env.NOTION_API_KEY;
const itemsDatabaseId = process.env.NOTION_ITEMS_DATABASE_ID;

if (!apiKey) {
  throw new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다.");
}
if (!itemsDatabaseId) {
  throw new Error("NOTION_ITEMS_DATABASE_ID 환경변수가 설정되지 않았습니다.");
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

// 에러 분류를 위한 내부 에러 클래스
class QuoteApiError extends Error {
  constructor(public readonly code: QuoteError) {
    super(code);
  }
}

// 계층 1: 실제 Notion API 호출 (성공 시 Quote 반환, 실패 시 throw)
// unstable_cache는 throw된 에러를 캐싱하지 않으므로 에러는 항상 재시도됨
async function fetchQuoteFromNotion(pageId: string): Promise<Quote> {
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
      throw new QuoteApiError("NOT_FOUND");
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

    return {
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
  } catch (e) {
    if (e instanceof QuoteApiError) throw e;
    if (e instanceof APIResponseError) {
      logger.warn(
        { pageId, status: e.status, code: e.code },
        "Notion API error",
      );
      if (e.status === 404) throw new QuoteApiError("NOT_FOUND");
      if (e.status === 401) throw new QuoteApiError("UNAUTHORIZED");
    } else {
      logger.error({ pageId, err: e }, "Unexpected error fetching quote");
    }
    throw new QuoteApiError("API_ERROR");
  }
}

// 계층 2: unstable_cache로 크로스 요청 캐싱 (60초 TTL)
// 성공 결과만 캐싱되며 에러(throw)는 캐싱되지 않음
const getCachedQuote = unstable_cache(fetchQuoteFromNotion, ["notion-quote"], {
  revalidate: 60,
});

// 계층 3: React cache로 요청 내 중복제거
// generateMetadata + 서버 컴포넌트가 각각 호출해도 실제 API는 1회만 실행
export const getQuote = cache(
  async (pageId: string): Promise<{ data: Quote } | { error: QuoteError }> => {
    try {
      const data = await getCachedQuote(pageId);
      return { data };
    } catch (e) {
      if (e instanceof QuoteApiError) {
        return { error: e.code };
      }
      logger.error({ pageId, err: e }, "Unexpected error in getQuote");
      return { error: "API_ERROR" };
    }
  },
);
