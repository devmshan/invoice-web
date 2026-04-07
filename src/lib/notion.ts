import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Client, APIResponseError } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Quote, QuoteError, QuoteItem, QuoteStatus } from "@/lib/types";
import { logger } from "@/lib/logger";

const apiKey = process.env.NOTION_API_KEY;
const itemsDatabaseId = process.env.NOTION_ITEMS_DATABASE_ID;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!apiKey) {
  throw new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다.");
}
if (!itemsDatabaseId) {
  throw new Error("NOTION_ITEMS_DATABASE_ID 환경변수가 설정되지 않았습니다.");
}
if (!databaseId) {
  throw new Error("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.");
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
function getSelect(prop: any, fallback = "draft"): string {
  // select 타입과 status 타입 모두 처리
  return prop?.select?.name ?? prop?.status?.name ?? fallback;
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

// PageObjectResponse와 items 배열을 받아 Quote 객체로 변환하는 헬퍼
function mapPageToQuote(page: PageObjectResponse, items: QuoteItem[]): Quote {
  const props = page.properties;
  return {
    id: page.id,
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

    // draft 상태 차단 (수신자는 draft 견적서에 접근 불가)
    const statusValue = getSelect(pageResponse.properties.status);
    if (statusValue === "draft") {
      throw new QuoteApiError("DRAFT_ACCESS_DENIED");
    }

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

    return mapPageToQuote(pageResponse, items);
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

// 견적서 목록을 Notion DB에서 조회 (items 제외, 목록용)
async function fetchQuoteListFromNotion(filters?: {
  status?: QuoteStatus;
}): Promise<Quote[]> {
  const quotes: Quote[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId!,
      filter: filters?.status
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ property: "status", status: { equals: filters.status } } as any)
        : undefined,
      sorts: [{ property: "issue_date", direction: "descending" }],
      start_cursor: cursor,
    });

    for (const page of response.results) {
      if (isFullPage(page)) {
        // 목록 조회에서는 items 불필요, 빈 배열로 처리
        quotes.push(mapPageToQuote(page, []));
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return quotes;
}

// 견적서 목록 조회 (React cache로 요청 내 중복제거)
export const getQuoteList = cache(
  async (filters?: { status?: QuoteStatus }): Promise<Quote[]> => {
    try {
      return await fetchQuoteListFromNotion(filters);
    } catch (e) {
      logger.error({ filters, err: e }, "Failed to fetch quote list");
      return [];
    }
  },
);

// 견적서 상태 업데이트 (관리자 전용)
// Notion의 status 프로퍼티 타입은 select가 아닌 status임
export async function updateQuoteStatus(
  pageId: string,
  status: QuoteStatus,
): Promise<void> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: { status: { name: status } } as any,
      },
    });
  } catch (e) {
    if (e instanceof APIResponseError) {
      logger.warn(
        { pageId, notionStatus: e.status, code: e.code },
        "Notion API error on updateQuoteStatus",
      );
    } else {
      logger.error(
        { pageId, err: e },
        "Unexpected error updating quote status",
      );
    }
    throw new QuoteApiError("API_ERROR");
  }
}

// 관리자용 견적서 단건 조회 (캐시 없음, draft 상태도 허용)
export async function getQuoteAdmin(pageId: string): Promise<Quote> {
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

    return mapPageToQuote(pageResponse, items);
  } catch (e) {
    if (e instanceof QuoteApiError) throw e;
    if (e instanceof APIResponseError) {
      logger.warn(
        { pageId, status: e.status, code: e.code },
        "Notion API error in getQuoteAdmin",
      );
      if (e.status === 404) throw new QuoteApiError("NOT_FOUND");
      if (e.status === 401) throw new QuoteApiError("UNAUTHORIZED");
    } else {
      logger.error({ pageId, err: e }, "Unexpected error in getQuoteAdmin");
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
