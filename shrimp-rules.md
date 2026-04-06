# Development Guidelines for invoice-web

## 1. Project Overview

노션 API 기반 견적서 공유/PDF 다운로드 서비스. 자체 DB 없음, 인증 없음, 서버 컴포넌트에서 Notion API 실시간 조회.

- **Framework**: Next.js 15.5.3 App Router + Turbopack
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york)
- **Data Source**: Notion API only (`@notionhq/client`)
- **PDF**: `window.print()` + `@media print` CSS

---

## 2. Directory Structure

```
invoice-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # 루트 레이아웃
│   │   ├── page.tsx                            # 루트 리디렉트 (사용 안 함)
│   │   ├── globals.css                         # 전역 CSS + @media print 스타일
│   │   ├── error.tsx                           # 전역 에러 바운더리
│   │   ├── not-found.tsx                       # 전역 404
│   │   ├── (marketing)/                        # 마케팅 라우트 그룹 (레이아웃 분리)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                        # 홈 랜딩 페이지 (/)
│   │   └── quote/
│   │       └── [pageId]/
│   │           ├── page.tsx                    # 견적서 뷰 (서버 컴포넌트)
│   │           ├── loading.tsx                 # 로딩 UI
│   │           ├── not-found.tsx              # 견적서 없음 404
│   │           ├── error.tsx                  # API 오류 에러 바운더리
│   │           └── _components/              # 이 페이지 전용 컴포넌트
│   │               └── pdf-download-button.tsx # 클라이언트 컴포넌트
│   ├── components/
│   │   ├── ui/                                # shadcn/ui 컴포넌트 (수동 수정 금지)
│   │   ├── layout/                            # 공통 레이아웃 컴포넌트
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   └── lib/
│       ├── types.ts                           # Quote, QuoteItem, QuoteError 타입
│       ├── utils.ts                           # cn() 등 공통 유틸
│       └── notion/                            # Notion API 관련 (Task-004~006에서 생성)
│           ├── client.ts                      # Notion 클라이언트 초기화
│           ├── queries.ts                     # pages.retrieve, databases.query (items DB 필터링)
│           └── parser.ts                      # Notion 응답 → Quote 타입 변환
└── docs/
    ├── PRD.md
    ├── ROADMAP.md                         # 작업 완료 시 반드시 업데이트
    └── guides/
```

---

## 3. Routing Rules

- **App Router만 사용** — Pages Router 파일 생성 금지
- **라우트 그룹 `(marketing)/`**: 마케팅/랜딩 페이지 전용, 새 공개 마케팅 페이지는 이 그룹 안에 추가
- **`_components/` 패턴**: 특정 페이지에서만 쓰는 컴포넌트는 해당 페이지 폴더 내 `_components/`에 배치 (언더스코어로 라우팅 제외)
- **`[pageId]` 파라미터**: Next.js 15에서 params는 `Promise`타입 — 반드시 `await params` 사용

```typescript
// ✅ 올바른 파라미터 접근 (Next.js 15)
export default async function QuotePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
}

// ❌ 금지 (Next.js 14 이하 방식)
export default function QuotePage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
}
```

---

## 4. Notion API Rules

### 4-1. 서버 전용 호출 강제

- Notion API 호출은 **서버 컴포넌트 또는 Server Action에서만** 수행
- 클라이언트 컴포넌트(`"use client"`)에서 Notion 클라이언트 import 절대 금지
- `lib/notion/client.ts`는 서버 전용 모듈 — 파일 상단에 서버 전용 표시 유지

### 4-2. 파일 위치 및 역할

| 파일                    | 역할                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `lib/notion/client.ts`  | `new Client({ auth: process.env.NOTION_API_KEY })` 초기화            |
| `lib/notion/queries.ts` | `notion.pages.retrieve()` (invoices), `notion.databases.query()` (items DB Relation 필터링) |
| `lib/notion/parser.ts`  | Notion API 응답 → `Quote` 타입 변환, Zod 검증                        |

### 4-3. 환경 변수

```
NOTION_API_KEY            # 필수 - Notion Integration Secret
NOTION_DATABASE_ID        # 필수 - invoices 데이터베이스 ID
NOTION_ITEMS_DATABASE_ID  # 필수 - items 데이터베이스 ID
```

- 환경 변수 미설정 시 명확한 에러 메시지 throw (silent fail 금지)
- `.env.local` 사용, `.env.example`에 키 목록 문서화

### 4-4. 오류 처리

| 오류                      | 처리 방법                                       |
| ------------------------- | ----------------------------------------------- |
| Notion 404 (Not Found)    | `notFound()` 호출 → `not-found.tsx` 표시        |
| Notion 401 (Unauthorized) | `throw` → `error.tsx` 에러 바운더리             |
| 네트워크 오류             | `throw` → `error.tsx` 에러 바운더리             |
| 유효기간 초과             | 페이지 유지 + 만료 배너 표시 (`isExpired` 분기) |

---

## 5. Type System Rules

- **모든 도메인 타입은 `lib/types.ts`에 집중 관리**
- 새 타입 추가 시 `lib/types.ts`에만 추가 (분산 금지)
- Notion API 응답 파싱용 Zod 스키마는 `lib/notion/parser.ts`에 위치

```typescript
// lib/types.ts 에 정의된 핵심 타입
type QuoteItem = { item_name: string; quantity: number; unit_price: number };
type QuoteStatus = "pending" | "accepted" | "rejected";
type Quote = {
  id: string;
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
type QuoteError = "NOT_FOUND" | "EXPIRED" | "API_ERROR" | "UNAUTHORIZED";
```

---

## 6. PDF Implementation Rules

- **PDF 생성은 `window.print()` 전용** — Puppeteer, jsPDF, html2canvas 등 외부 라이브러리 추가 금지
- PDF 트리거 버튼: `app/quote/[pageId]/_components/pdf-download-button.tsx` (클라이언트 컴포넌트)
- 인쇄 시 숨길 요소: `print:hidden` Tailwind 클래스 사용 (헤더, 푸터, 다운로드 버튼, 만료 배너)
- 인쇄 스타일: `app/globals.css`의 `@media print` 블록에 추가
- 용지 크기: A4, 여백 최소화, 배경색 유지 설정

```tsx
// ✅ 올바른 PDF 버튼 패턴
"use client";
export function PdfDownloadButton() {
  return <button onClick={() => window.print()}>PDF 다운로드</button>;
}
```

---

## 7. Component Placement Rules

| 상황                      | 위치                                              |
| ------------------------- | ------------------------------------------------- |
| 특정 페이지 전용 컴포넌트 | `app/[route]/_components/`                        |
| 여러 페이지에서 공용      | `components/` (적절한 하위 폴더)                  |
| shadcn/ui 컴포넌트        | `components/ui/` (npx shadcn@latest add로만 추가) |
| 레이아웃 컴포넌트         | `components/layout/`                              |

- `components/ui/` 파일은 **직접 수정 금지** — shadcn/ui CLI로만 관리
- 서버 컴포넌트가 기본값 — `"use client"` 필요한 경우에만 추가
- 금액 계산 로직은 서버 컴포넌트(`page.tsx`)에서 수행, 클라이언트에 노출 금지

---

## 8. Post-Task Actions (필수)

작업 완료 후 반드시 수행:

1. `npm run check-all` — 모든 검사 통과 확인
2. `npm run build` — 프로덕션 빌드 성공 확인
3. `docs/ROADMAP.md` — 완료된 Task 항목에 `✅` 표시 업데이트

---

## 9. Prohibited Actions

- **Notion API를 클라이언트 컴포넌트에서 호출** — API 키 노출 위험
- **자체 데이터베이스(DB) 추가** — 이 서비스는 Notion만 데이터 소스로 사용
- **인증/로그인 기능 추가** — MVP 범위 외 (middleware.ts 생성 금지)
- **PDF용 외부 라이브러리 추가** — window.print() + CSS print로만 구현
- **`components/ui/` 직접 편집** — shadcn/ui CLI로만 관리
- **`src/` 밖에 app/, components/, lib/ 생성** — 반드시 `src/` 하위에 배치
- **Pages Router 파일 생성** — App Router 전용 프로젝트
- **결제, 이메일, 견적서 승인/거절 등 MVP 이후 기능 구현** — PRD에서 제외된 기능
- **`lib/types.ts` 외 위치에 도메인 타입 분산 정의**
