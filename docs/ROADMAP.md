# invoice-web 개발 로드맵

프리랜서/1인 업체가 노션에 작성한 견적서를 고유 URL로 공유하고 PDF로 다운로드할 수 있는 웹 서비스

## 개요

invoice-web은 견적서를 보내는 프리랜서/1인 업체(발행자)와 견적서를 받아 확인하는 클라이언트(수신자)를 위한 서비스로 다음 기능을 제공합니다:

- **노션 API 데이터 조회 (F001)**: 노션 페이지 ID 기반 견적서 데이터 실시간 조회
- **견적서 웹 렌더링 (F002)**: 구조화된 견적서 형태로 화면에 표시
- **금액 자동 계산 표시 (F003)**: 항목별 단가/수량 기반 소계, 세금(10%), 합계 계산 및 표시
- **PDF 다운로드 (F004)**: 브라우저 인쇄 API 기반 PDF 변환 및 다운로드
- **오류/만료 처리 (F005)**: 존재하지 않는 ID 접근 및 유효기간 초과 시 안내 표시

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
   - 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료로 표시

---

## 개발 단계

### Phase 1: 프로젝트 초기 설정 ✅

- **Task-001: Next.js 프로젝트 초기화 및 기본 설정** ✅ - 완료
  - ✅ Next.js 15.5.3 (App Router + Turbopack) 프로젝트 생성
  - ✅ TypeScript 5, TailwindCSS v4, shadcn/ui (new-york style) 설정
  - ✅ ESLint + Prettier + Husky + lint-staged 개발 도구 구성
  - ✅ 기본 프로젝트 디렉토리 구조 확립 (`app/`, `components/`, `lib/`)

- **Task-002: 기본 페이지 구조 및 공통 컴포넌트 생성** ✅ - 완료
  - ✅ App Router 기반 라우트 구조 생성 (`/`, `/quote/[pageId]`)
  - ✅ 공통 레이아웃 컴포넌트 구현 (Header, Footer, Container)
  - ✅ 홈 랜딩 페이지 UI 구현 (서비스 소개, 사용 방법 안내)
  - ✅ `not-found.tsx`, `error.tsx` 기본 오류 페이지 생성
  - ✅ `lib/types.ts`에 `Quote`, `QuoteItem`, `QuoteError` 타입 정의

- **Task-003: 견적서 뷰 페이지 UI 골격 구현** ✅ - 완료
  - ✅ `app/quote/[pageId]/page.tsx` 서버 컴포넌트 골격 생성
  - ✅ 견적서 레이아웃 구현 (헤더, 발행자/수신자 정보, 항목 테이블, 금액 요약, 메모)
  - ✅ 금액 자동 계산 로직 구현 (소계, 세금 10%, 합계)
  - ✅ 유효기간 만료 판별 및 만료 배너 UI 구현
  - ✅ PDF 다운로드 버튼 클라이언트 컴포넌트 생성 (`PdfDownloadButton`)
  - ✅ `generateMetadata` 함수로 동적 메타데이터 생성

---

### Phase 2: Notion API 연동 (F001, F010) ✅

- **Task-004: Notion API 클라이언트 설정 및 환경 구성** ✅ - 완료
  - ✅ `@notionhq/client` 패키지 설치
  - ✅ `.env.local`에 환경 변수 정의 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_ITEMS_DATABASE_ID`)
  - ✅ `.env.example` 파일 생성 (환경 변수 목록 문서화)
  - ✅ `lib/notion.ts`에 Notion API 클라이언트 초기화 로직 구현
  - ✅ 환경 변수 미설정 시 명확한 에러 메시지 출력

- **Task-005: Notion 데이터 조회 및 타입 변환 구현** ✅ - 완료
  - ✅ `lib/notion.ts`에 `invoices` DB 페이지 조회 함수 구현 (`notion.pages.retrieve`)
  - ✅ `lib/notion.ts`에 `items` DB 항목 조회 함수 구현
    - ✅ `notion.databases.query`로 `invoice` Relation 필터링
    - ✅ `sort_order` 기준 오름차순 정렬
  - ✅ 노션 API 응답을 `Quote` 타입으로 변환하는 파서 함수 구현 (`lib/notion.ts` 단일 파일로 통합)
  - ✅ 노션 데이터베이스 스키마(F010)에 맞춘 속성 매핑 로직 구현

- **Task-006: Notion API 오류 처리** ✅ - 완료
  - ✅ 노션 API 오류 유형별 처리 로직 구현 (404 Not Found, 401 Unauthorized, 네트워크 오류)
  - ✅ `QuoteError` 타입과 매핑 (`NOT_FOUND`, `UNAUTHORIZED`, `API_ERROR`)
  - ✅ Next.js 서버 컴포넌트에서 오류 처리 (`notFound()` 및 Error throw)

---

### Phase 3: 견적서 뷰 UI 구현 (F002, F003, F011) ✅

- **Task-007: 견적서 뷰 페이지에 실제 데이터 연동** ✅ - 완료
  - ✅ `app/quote/[pageId]/page.tsx`에서 `lib/notion.ts`의 `getQuote` 함수 사용
  - ✅ 데이터 조회 실패 시 오류 페이지 분기 처리 (`notFound()` 활용)
  - ✅ 견적서 제목을 동적 메타데이터에 반영 (`generateMetadata`)

- **Task-008: 금액 계산 유틸리티 및 포맷팅 함수 분리** ✅ - 완료
  - See: `/tasks/008-currency-utils.md`
  - ✅ `lib/utils/currency.ts`에 금액 포맷팅 유틸리티 함수 구현 (`formatKRW`, `calcQuoteTotals`)
  - ✅ 금액 계산 로직을 별도 유틸리티로 분리 (소계 합산, 세금 계산, 합계)
  - ✅ 견적서 뷰 컴포넌트를 세분화하여 분리 (QuoteHeader, QuoteParties, QuoteItemsTable, QuoteSummary)
  - ✅ 견적서 뷰 페이지를 분리된 컴포넌트 조합으로 단순화

- **Task-009: 견적서 핵심 기능 통합 테스트** ✅ - 완료
  - See: `/tasks/009-integration-test.md`
  - ✅ 정상 견적서 렌더링 검증 (제목, 발행자/수신자 정보, 항목 테이블)
  - ✅ 금액 계산 정확성 검증 (소계, 세금 10%, 합계)
  - ✅ 유효한 견적서 접근 시 만료 배너 미표시 확인
  - ✅ 만료된 견적서 접근 시 만료 배너 표시 및 유효기간 빨간색 강조 확인
  - ✅ 존재하지 않는 UUID 접근 시 404 페이지 표시 검증
  - ✅ 잘못된 형식 ID 접근 시 API 에러 페이지 표시 검증

---

### Phase 4: PDF 다운로드 구현 (F004) ✅

- **Task-010a: PDF 다운로드 버튼 구현** ✅ - 완료
  - ✅ `PdfDownloadButton` 컴포넌트에 `window.print()` 호출 로직 구현
  - ✅ 로딩 상태 처리 (인쇄 다이얼로그 열리는 동안 `Loader2` 스피너 표시)
  - ✅ 접근성 속성 적용 (`aria-label`)
  - 관련 파일: `src/app/quote/[pageId]/_components/pdf-download-button.tsx`

- **Task-010b: 인쇄 CSS 최적화** ✅ - 완료
  - ✅ `@media print` 스타일 전역 CSS에 추가
  - ✅ `print:hidden` 유틸리티 클래스로 불필요 요소 숨김 처리
  - ✅ A4 용지 크기, 여백(16mm/12mm) 설정
  - ✅ 배경 색상 출력 허용 (`print-color-adjust: exact`)
  - ✅ 라이트 모드 강제 적용 (다크 모드 CSS 변수 오버라이드)
  - ✅ 테이블 행 페이지 나눔 방지 (`page-break-inside: avoid`)
  - 관련 파일: `src/app/globals.css`

- **Task-010c: 인쇄 레이아웃 검증 및 테스트** ✅ - 완료
  - ✅ Playwright MCP로 `@media print` CSS 규칙 7개 전체 로드 확인
  - ✅ `.print\:hidden { display: none !important; }` 규칙 존재 확인
  - ✅ `@page { size: a4; margin: 16mm 12mm; }` A4 설정 확인
  - ✅ `print-color-adjust: exact` 배경 색상 출력 확인
  - ✅ `break-inside: avoid` 테이블 페이지 나눔 방지 확인
  - ✅ `page.tsx` 코드 리뷰로 만료 배너/PDF 버튼에 `print:hidden` 클래스 적용 확인

---

### Phase 5: 오류 처리 (F005) ✅

- **Task-011: 오류 페이지 및 만료 처리 구현** ✅ - 완료
  - See: `/tasks/011-error-pages.md`
  - ✅ `app/quote/[pageId]/not-found.tsx` 커스텀 404 페이지 구현 (존재하지 않는 견적서 안내 + 홈으로 돌아가기 링크)
  - ✅ `app/quote/[pageId]/error.tsx` 에러 바운더리 구현 (`'use client'` 적용, error/reset props, 오류 코드 표시, 다시 시도 버튼)
  - ✅ 기존 전역 오류 페이지 패턴(Container, 메시지 구조) 일관성 유지
  - ✅ Playwright MCP로 UUID not-found / API error 페이지 렌더링 모두 확인

---

### Phase 6: 배포 (Vercel)

- **Task-012: 전체 UI 다듬기 및 반응형 최적화** ✅ - 완료
  - See: `/tasks/012-ui-polish.md`
  - ✅ `generateMetadata`에 `openGraph` 태그 추가 (title, description, type: "website")
  - ✅ 모든 quote 컴포넌트 반응형 점검 완비 확인
    - `quote-items-table.tsx`: `overflow-x-auto` + `min-w-[480px]`
    - `quote-parties.tsx`: `sm:grid-cols-2`
    - `quote-header.tsx`: `sm:flex-row sm:items-start sm:justify-between`
    - `quote-summary.tsx`: `w-full sm:w-72`
  - ✅ Playwright MCP 모바일 375px 뷰포트 스크린샷 검증 완료
  - ✅ `globals.css` `--font-sans` 순환참조 버그 수정
  - ✅ `app/quote/[pageId]/loading.tsx` 로딩 스켈레톤 UI 추가

- **Task-013: Vercel 배포 및 운영 환경 구성** - 우선순위
  - 프로덕션 빌드 검증 (`npm run build` 및 `npm run check-all` 성공 확인)
  - Vercel 프로젝트 생성 및 GitHub 연동
  - Vercel 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
  - 커스텀 도메인 설정 (선택)
  - 배포 후 실제 노션 데이터로 E2E 검증

---

### Phase 7: 운영 안정성 강화 ✅

- **Task-014: 구조화된 로깅 시스템 구축** ✅ - 완료
  - ✅ pino 라이브러리 기반 구조화된 JSON 로거 구현 (`src/lib/logger.ts`)
  - ✅ Notion API 에러 로깅 적용 (`src/lib/notion.ts` catch 블록에 logger.warn/error)
  - ✅ 개발(pino-pretty)/프로덕션(JSON) 환경별 로그 레벨 분리
  - ✅ `.env.example`에 `LOG_LEVEL` 환경변수 추가

- **Task-015: Notion API 캐싱 전략 구현** ✅ - 완료
  - ✅ Layer1: `fetchQuoteFromNotion` (실제 API 호출)
  - ✅ Layer2: `unstable_cache`로 크로스 요청 캐싱 (60초 TTL)
  - ✅ Layer3: React `cache()`로 요청 내 중복제거
  - ✅ 에러 응답 캐싱 방지 (throw 방식으로 처리)

- **Task-016: Rate Limiting 미들웨어 구현** ✅ - 완료
  - ✅ `src/middleware.ts` 신규 생성 (Edge Runtime 호환)
  - ✅ IP 기반 슬라이딩 윈도우 방식 (1분당 30회 제한)
  - ✅ `/quote/:path*` 경로에만 적용, 초과 시 429 응답 + `Retry-After` 헤더
  - ✅ 요청 로깅 통합 (Edge Runtime 제약으로 console.info 사용)
