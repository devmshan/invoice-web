# Development Guidelines for invoice-web

## 1. Project Overview

노션 API 기반 견적서 공유/PDF 다운로드 서비스. 자체 DB 없음, 인증 없음, 서버 컴포넌트에서 Notion API 실시간 조회.

- **Framework**: Next.js 15.5.14 App Router + Turbopack
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york)
- **Data Source**: Notion API only (`@notionhq/client`)
- **PDF**: `window.print()` + `@media print` CSS
- **Logging**: pino (`src/lib/logger.ts`)
- **Rate Limiting**: `src/middleware.ts` (Edge Runtime, /quote/* 경로)

---

## 2. Directory Structure (현재 실제 구조)

```
src/
  app/
    layout.tsx                    # 루트 레이아웃 (next/font Geist 설정)
    globals.css                   # Tailwind v4 @theme inline + @media print
    (marketing)/page.tsx          # 홈 랜딩 (/)
    quote/[pageId]/
      page.tsx                    # 견적서 서버 컴포넌트 (async, generateMetadata)
      loading.tsx                 # Suspense 폴백 UI
      error.tsx                   # 에러 바운더리 (use client)
      not-found.tsx               # 견적서 404
      _components/                # 페이지 전용 컴포넌트
        quote-header.tsx
        quote-parties.tsx
        quote-items-table.tsx
        quote-summary.tsx
        pdf-download-button.tsx   # 클라이언트 컴포넌트
  components/
    ui/                           # shadcn/ui (직접 수정 금지)
    layout/                       # Header, Footer, Container
  lib/
    notion.ts                     # Notion API + 3계층 캐싱 + logger 통합 (단일 파일)
    logger.ts                     # pino 로거
    types.ts                      # Quote, QuoteItem, QuoteError 타입
    utils.ts                      # cn() 공통 유틸
    utils/currency.ts             # formatKRW, calcQuoteTotals
  middleware.ts                   # Rate Limiting (Edge Runtime)
docs/
  ROADMAP.md                      # 작업 완료 시 반드시 ✅ 업데이트
  PRD.md
  guides/
```

---

## 3. Routing Rules

- **App Router만 사용** — Pages Router 파일 생성 금지
- **`[pageId]` 파라미터**: Next.js 15에서 params는 `Promise` 타입 — 반드시 `await params` 사용

```typescript
// ✅ 올바른 파라미터 접근 (Next.js 15)
export default async function QuotePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
}
```

---

## 4. Notion API & Caching Rules

### 4-1. 데이터 조회 진입점

- **`src/lib/notion.ts`의 `getQuote(pageId)` 만 사용** — page.tsx에서 직접 Notion 클라이언트 호출 금지
- `getQuote`는 React `cache()`로 래핑되어 요청 내 중복 호출을 자동 제거

### 4-2. 캐싱 3계층 구조 (수정 시 전체 검토)

| 계층 | 함수 | 역할 |
|------|------|------|
| Layer 1 | `fetchQuoteFromNotion` | 실제 Notion API 호출 |
| Layer 2 | `getCachedQuote` = `unstable_cache(..., { revalidate: 60 })` | 크로스 요청 60초 TTL |
| Layer 3 | `getQuote` = `cache(getCachedQuote)` | 요청 내 중복 제거 |

- `generateMetadata`와 `page` 컴포넌트 모두 `getQuote` 호출해도 API는 1회만 실행됨
- `unstable_cache` 내부에서 에러는 반드시 `throw` (return 금지 — 에러 캐싱 방지)

### 4-3. 환경 변수

```
NOTION_API_KEY            # 필수 - Notion Integration Secret
NOTION_DATABASE_ID        # 필수 - invoices 데이터베이스 ID
NOTION_ITEMS_DATABASE_ID  # 필수 - items 데이터베이스 ID
LOG_LEVEL                 # 선택 - 기본값: prod=info, dev=debug
```

### 4-4. 오류 처리

| 오류 | 처리 방법 |
|------|-----------|
| Notion 404 (Not Found) | `notFound()` 호출 → `not-found.tsx` |
| Notion 401 (Unauthorized) | `throw` → `error.tsx` |
| 네트워크 오류 | `throw` → `error.tsx` |
| 유효기간 초과 | 페이지 유지 + 만료 배너 (`isExpired` 분기) |

---

## 5. Logger Usage Rules

- **서버 컴포넌트 / lib**: `import { logger } from "@/lib/logger"` 사용
  - `logger.warn({ pageId, status }, "message")` / `logger.error({ pageId, err }, "message")`
- **Edge Runtime (`middleware.ts`)**: `console.info(JSON.stringify({...}))` 사용 (pino Edge 미지원)
- **클라이언트 컴포넌트**: 로거 사용 금지

---

## 6. Rate Limiting Rules

- **위치**: `src/middleware.ts` 단일 파일에서만 처리
- **적용 경로**: `/quote/:path*` (`export const config = { matcher: ["/quote/:path*"] }`)
- **방식**: 인메모리 Map 기반 슬라이딩 윈도우 (1분/30회)
- **주의**: Vercel Edge 다중 인스턴스에서는 인스턴스 간 상태 비공유 (현재 구현 한계)

---

## 7. Styling Rules

- **Tailwind v4**: `tailwind.config.*` 없음, `globals.css`의 `@theme inline` 블록에서 설정
- **폰트**: `--font-sans: var(--font-geist-sans)` — layout.tsx의 CSS 변수 참조 (순환 참조 금지)
- **인쇄 CSS**: `globals.css`의 `@media print` 블록에서만 관리
- **print:hidden**: 인쇄 시 숨길 요소에 적용 (만료 배너, PDF 버튼, 헤더, 푸터)
- **shadcn/ui 추가**: `npx shadcn@latest add [component]` — `components/ui/` 직접 수정 금지

---

## 8. Component Placement Rules

| 상황 | 위치 |
|------|------|
| 특정 페이지 전용 컴포넌트 | `app/[route]/_components/` |
| 여러 페이지에서 공용 | `components/` |
| shadcn/ui 컴포넌트 | `components/ui/` (CLI로만 추가) |
| 레이아웃 컴포넌트 | `components/layout/` |

- 서버 컴포넌트가 기본값 — `"use client"` 필요한 경우에만 추가
- PDF 관련 클라이언트 로직: `_components/pdf-download-button.tsx`만 담당

---

## 9. File Modification Coordination

| 수정 파일 | 동시 업데이트 필요 |
|-----------|-------------------|
| `src/lib/notion.ts` (캐싱 구조 변경) | 3계층 전체 검토 |
| `src/lib/types.ts` (타입 변경) | `notion.ts` 파서 + 관련 컴포넌트 |
| `globals.css` (@theme inline 변경) | `layout.tsx` CSS 변수명 확인 |
| `.env.example` | `docs/guides/notion-schema.md` 환경변수 섹션 |
| 태스크 완료 | `docs/ROADMAP.md` ✅ 표시 + shrimp `verify_task` |

---

## 10. Post-Task Actions (필수)

1. `npm run check-all` — lint + format + typecheck 모두 통과 확인
2. `npm run build` — 프로덕션 빌드 성공 확인
3. `docs/ROADMAP.md` — 완료된 Task에 `✅` 업데이트
4. shrimp-task-manager `verify_task` — 태스크 상태 완료 처리

---

## 11. Prohibited Actions

- **Notion API를 클라이언트 컴포넌트에서 호출** — API 키 노출 위험
- **page.tsx에서 직접 Notion 클라이언트 호출** — 반드시 `getQuote()` 경유
- **`unstable_cache` 내부에서 에러를 return** — 에러 캐싱 방지를 위해 throw 사용
- **`middleware.ts`에서 pino logger import** — Edge Runtime 비호환
- **클라이언트 컴포넌트에서 logger import**
- **`components/ui/` 직접 편집** — shadcn/ui CLI로만 관리
- **PDF용 외부 라이브러리 추가** — window.print() + CSS만 사용
- **자체 데이터베이스(DB) 추가** — Notion이 유일한 데이터 소스
- **Pages Router 파일 생성** — App Router 전용
- **`npm run check-all` 미실행 상태로 다음 단계 진행**
