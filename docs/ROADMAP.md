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

### Phase 2: Notion API 연동 (F001, F010)

- **Task-004: Notion API 클라이언트 설정 및 환경 구성** - 우선순위
  - `@notionhq/client` 패키지 설치
  - `.env.local`에 환경 변수 정의 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
  - `.env.example` 파일 생성 (환경 변수 목록 문서화)
  - `lib/notion/client.ts`에 Notion API 클라이언트 초기화 로직 구현
  - 환경 변수 미설정 시 명확한 에러 메시지 출력

- **Task-005: Notion 데이터 조회 및 타입 변환 구현**
  - `lib/notion/queries.ts`에 페이지 데이터 조회 함수 구현 (`notion.pages.retrieve`)
  - `lib/notion/queries.ts`에 하위 블록(견적 항목) 조회 함수 구현 (`notion.blocks.children.list`)
  - 노션 API 응답을 `Quote` 타입으로 변환하는 파서 함수 구현 (`lib/notion/parser.ts`)
  - Zod 스키마를 활용한 노션 API 응답 데이터 유효성 검증
  - 노션 데이터베이스 스키마(F010)에 맞춘 속성 매핑 로직 구현
  - Playwright MCP를 활용한 API 연동 통합 테스트

- **Task-006: Notion API 오류 처리 및 캐싱 전략**
  - 노션 API 오류 유형별 처리 로직 구현 (404 Not Found, 401 Unauthorized, 네트워크 오류)
  - 커스텀 에러 클래스 정의 및 `QuoteError` 타입과 매핑
  - Next.js 서버 컴포넌트 캐싱 전략 적용 (revalidate 설정)
  - API 호출 실패 시 재시도 로직 고려 (선택)

---

### Phase 3: 견적서 뷰 UI 구현 (F002, F003, F011)

- **Task-007: 견적서 뷰 페이지에 실제 데이터 연동** - 우선순위
  - `app/quote/[pageId]/page.tsx`의 `getQuote` 함수를 Notion API 호출로 교체
  - 데이터 조회 실패 시 오류 페이지 분기 처리 (`notFound()` 활용)
  - 로딩 상태 UI 구현 (`app/quote/[pageId]/loading.tsx`)
  - 견적서 제목을 동적 메타데이터에 반영

- **Task-008: 금액 계산 유틸리티 및 포맷팅 함수 분리**
  - `lib/utils/currency.ts`에 금액 포맷팅 유틸리티 함수 구현 (원화 형식, 천단위 콤마)
  - 금액 계산 로직을 별도 유틸리티로 분리 (소계 합산, 세금 계산, 합계)
  - 견적서 뷰 컴포넌트를 세분화하여 분리 (QuoteHeader, QuoteParties, QuoteItemsTable, QuoteSummary)
  - Playwright MCP를 활용한 금액 계산 정확성 및 포맷팅 테스트

- **Task-009: 견적서 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 견적서 뷰 페이지 전체 플로우 테스트
  - 노션 API 연동 데이터가 올바르게 렌더링되는지 검증
  - 금액 계산 정확성 검증 (소계, 세금, 합계)
  - 유효기간 만료/유효 상태별 UI 표시 검증
  - 에러 핸들링 및 엣지 케이스 테스트 (빈 항목, 잘못된 ID 등)

---

### Phase 4: PDF 다운로드 구현 (F004)

- **Task-010: PDF 다운로드 기능 완성** - 우선순위
  - `PdfDownloadButton` 컴포넌트에 `window.print()` 호출 로직 구현
  - `@media print` CSS 스타일 최적화 (인쇄 시 불필요 요소 숨김: 헤더, 푸터, 다운로드 버튼)
  - 인쇄 시 페이지 여백, 용지 크기(A4), 배경 색상 설정
  - 인쇄 미리보기에서 견적서가 단일 페이지에 깔끔하게 출력되는지 레이아웃 검증
  - Playwright MCP를 활용한 PDF 다운로드 플로우 테스트

---

### Phase 5: 오류 처리 (F005)

- **Task-011: 오류 페이지 및 만료 처리 구현** - 우선순위
  - `app/quote/[pageId]/not-found.tsx` 커스텀 404 페이지 구현 (존재하지 않는 견적서 안내)
  - `app/quote/[pageId]/error.tsx` 에러 바운더리 구현 (API 오류 등 예외 처리)
  - 오류 유형별 안내 메시지 차별화 (존재하지 않음, API 오류, 인증 오류)
  - 만료된 견적서 접근 시 만료 안내 배너 표시 (페이지 내용은 유지, 상단 경고 배지)
  - 발행자에게 문의 안내 메시지 표시
  - Playwright MCP를 활용한 오류 시나리오별 E2E 테스트

---

### Phase 6: 배포 (Vercel)

- **Task-012: 전체 UI 다듬기 및 반응형 최적화** - 우선순위
  - 견적서 뷰 페이지 반응형 레이아웃 최적화 (모바일에서도 테이블 가독성 확보)
  - 인쇄 시 라이트 모드 강제 적용
  - SEO 메타 태그 및 OG 이미지 설정
  - 접근성(a11y) 점검 및 개선
  - Playwright MCP를 활용한 반응형 UI 테스트

- **Task-013: Vercel 배포 및 운영 환경 구성**
  - 프로덕션 빌드 검증 (`npm run build` 및 `npm run check-all` 성공 확인)
  - Vercel 프로젝트 생성 및 GitHub 연동
  - Vercel 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
  - 커스텀 도메인 설정 (선택)
  - 배포 후 실제 노션 데이터로 E2E 검증
