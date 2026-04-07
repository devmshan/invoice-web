# invoice-web 개발 로드맵

프리랜서/1인 업체가 노션에 작성한 견적서를 고유 URL로 공유하고 PDF로 다운로드할 수 있는 웹 서비스

## 개요

invoice-web은 견적서를 보내는 프리랜서/1인 업체(발행자)와 견적서를 받아 확인하는 클라이언트(수신자)를 위한 서비스로 다음 기능을 제공합니다:

- **노션 API 데이터 조회**: 노션 페이지 ID 기반 견적서 데이터 실시간 조회
- **견적서 웹 렌더링**: 구조화된 견적서 형태로 화면에 표시
- **금액 자동 계산 표시**: 항목별 단가/수량 기반 소계, 세금(10%), 합계 계산 및 표시
- **PDF 다운로드**: 브라우저 인쇄 API 기반 PDF 변환 및 다운로드
- **관리자 대시보드**: 견적서 목록 조회, 상태 관리, 링크 공유, 이메일 발송
- **인증 시스템**: 관리자 로그인 및 접근 제어

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `018-auth-system.md`)
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

## MVP 완료 요약 (Phase 1~7)

**전체 완료일**: 2026-04-06 | **총 Task**: 17개 | **상세 내용**: `docs/roadmaps/ROADMAP_v1.md` 참조

| Phase   | 설명               | Task 수 | Task 번호        | 상태    |
| ------- | ------------------ | ------- | ---------------- | ------- |
| Phase 1 | 프로젝트 초기 설정 | 3       | Task-001 ~ 003   | ✅ 완료 |
| Phase 2 | Notion API 연동    | 3       | Task-004 ~ 006   | ✅ 완료 |
| Phase 3 | 견적서 뷰 UI 구현  | 3       | Task-007 ~ 009   | ✅ 완료 |
| Phase 4 | PDF 다운로드 구현  | 3       | Task-010a ~ 010c | ✅ 완료 |
| Phase 5 | 오류 처리          | 1       | Task-011         | ✅ 완료 |
| Phase 6 | 배포 (Vercel)      | 2       | Task-012 ~ 013   | ✅ 완료 |
| Phase 7 | 운영 안정성 강화   | 4       | Task-014 ~ 017   | ✅ 완료 |

---

## 기술 결정 기록 (ADR)

### ADR-001: 관리자 비밀번호 저장소 - Vercel KV 채택

- **결정**: `ADMIN_PASSWORD_HASH` 환경변수 대신 Vercel KV(Redis)에 비밀번호 해시 저장
- **이유**: Vercel 서버리스 인스턴스는 각각 독립된 `process.env`를 가지므로, 앱 내에서 환경변수를 수정해도 다른 인스턴스에 반영되지 않음. 재배포 없이는 비밀번호 변경 기능 구현 불가
- **Vercel KV 선택 근거**:
  - 무료 플랜으로 충분 (256MB, 30만 req/월)
  - 재배포 없이 즉시 반영 (모든 인스턴스에서 동일 값 조회)
  - Vercel 생태계 내에서 해결 (추가 플랫폼 불필요)
  - 비활성 정지 없음 (Supabase 무료 플랜 대비 안정적)
- **검토한 대안**:
  - Vercel Postgres: 오버스펙, DB 스키마/마이그레이션 필요
  - Supabase Auth: 비활성 1주 정지 정책 리스크
  - Vercel API 프로그래매틱 환경변수 업데이트: 앱에 Vercel 전체 제어권 토큰 저장 필요 → 보안 역설
- **영향 범위**: Task-018 (환경 구성), Task-019 (인증 로직), Task-029 (비밀번호 변경)

---

## 고도화 개발 단계

### Phase 8: 보안 인프라 및 인증 시스템 ✅

- **Task-018: 보안 기반 환경 구성 및 입력 검증 강화** ✅ - 완료
  - See: `/tasks/018-security-env-validation.md`
  - ✅ `jose`, `bcryptjs`, `@vercel/kv` 패키지 설치
  - ✅ `src/lib/env.ts` 생성 - Zod 기반 런타임 환경 변수 검증 (AUTH_SECRET, ADMIN_EMAIL, KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, NEXT_PUBLIC_BASE_URL)
  - ✅ `src/lib/kv.ts` 생성 - Vercel KV 클라이언트 초기화 및 관리자 비밀번호 해시 조회/저장 유틸리티
  - ✅ `scripts/seed-admin.ts` 생성 - 초기 관리자 비밀번호 해시를 KV에 시드하는 스크립트
  - ✅ `src/lib/schemas/quote.ts` 생성 - `pageIdSchema` UUID v4 정규식 검증
  - ✅ `src/app/quote/[pageId]/page.tsx`에 pageId 사전 검증 적용 (형식 오류 시 Notion API 호출 없이 즉시 `notFound()`)
  - ✅ `QuoteStatus` 타입 확장: `"draft" | "sent" | "accepted" | "rejected"` (`src/lib/types.ts`)
  - ✅ `src/lib/schemas/auth.ts` 생성 - 비밀번호 복잡도/로그인/변경 Zod 스키마
  - ✅ `.env.example` 업데이트 (신규 환경 변수 추가)
  - 관련 파일: `src/lib/env.ts`, `src/lib/kv.ts`, `src/lib/types.ts`, `src/lib/schemas/quote.ts`, `src/lib/schemas/auth.ts`, `scripts/seed-admin.ts`, `.env.example`

- **Task-019: JWT 인증 및 세션 관리 구현** ✅ - 완료
  - See: `/tasks/019-jwt-auth-session.md`
  - ✅ `src/lib/auth.ts` 생성 - `jose` 기반 JWT 발급/검증 (HS256, Edge Runtime 호환), bcrypt 해싱, httpOnly 쿠키 유틸리티
  - ✅ `src/lib/auth-guard.ts` 생성 - `requireAdmin()` 가드 함수 (쿠키 토큰 추출 -> jose 검증)
  - ✅ `src/app/admin/login/actions.ts` 생성 - 로그인 Server Action
  - ✅ `src/app/admin/actions.ts` 생성 - 로그아웃 Server Action
  - 관련 파일: `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/app/admin/login/actions.ts`, `src/app/admin/actions.ts`

- **Task-020a: 보안 헤더 및 감사 로깅 시스템** ✅ - 완료
  - See: `/tasks/020a-security-headers-logging.md`
  - ✅ `next.config.ts`에 HTTP 보안 헤더 5종 추가 (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP)
  - ✅ `src/lib/logger.ts` 확장 - `securityLogger`, `auditLogger` child 로거 추가
  - 관련 파일: `next.config.ts`, `src/lib/logger.ts`

- **Task-020: 미들웨어 보안 강화 (인증 + Rate Limit 확장)** ✅ - 완료
  - See: `/tasks/020-middleware-security.md`
  - ✅ `src/middleware.ts` 전면 재작성 - matcher에 `/admin/:path*` 추가
  - ✅ 경로별 Rate Limit 차등 적용 (login: 5회/분, admin: 60회/분, quote: 30회/분)
  - ✅ 브루트포스 방어용 loginFailures Map (IP 기반 5회 연속 실패 시 15분 잠금)
  - ✅ 미인증 `/admin/*` 접근 시 `/admin/login` 리다이렉트
  - ✅ 슬라이딩 세션 갱신 (만료 15분 미만 시 토큰 재발급)
  - ✅ `securityLogger`로 보안 이벤트 로깅
  - 관련 파일: `src/middleware.ts`

---

### Phase 9: 관리자 레이아웃 및 견적서 목록 ✅

- **Task-021: 관리자 로그인 페이지 및 레이아웃 구현** ✅ - 완료
  - See: `/tasks/021-admin-login-layout.md`
  - ✅ `/admin/login` 로그인 페이지 UI (React Hook Form + Zod + useActionState)
  - ✅ 로그인 Server Action (bcryptjs 검증 -> jose JWT 발급 -> httpOnly 쿠키)
  - ✅ `securityLogger`로 로그인 시도/성공/실패 로깅
  - ✅ Route Group `(protected)` 기반 레이아웃 (AdminSidebar + AdminHeader + LogoutButton)
  - ✅ 반응형 레이아웃 (모바일 Sheet 햄버거 메뉴)
  - ✅ `/admin` -> `/admin/quotes` 리다이렉트, not-found.tsx, error.tsx 오류 페이지
  - 관련 파일: `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/app/admin/login/_components/login-form.tsx`, `src/app/admin/(protected)/layout.tsx`, `src/app/admin/(protected)/_components/admin-sidebar.tsx`, `src/app/admin/(protected)/_components/admin-header.tsx`, `src/app/admin/actions.ts`

- **Task-022: 견적서 목록 및 상세 페이지 구현** ✅ - 완료
  - See: `/tasks/022-quotes-list-detail.md`
  - ✅ 견적서 목록 테이블 UI (제목, 수신자, 발행일, 유효기간, 상태, 상세보기)
  - ✅ QuoteStatusBadge 컴포넌트 (draft: 회색, sent: 파란색, accepted: 녹색, rejected: 빨간색)
  - ✅ 상태별 필터링 탭 (전체/초안/발송/수락/거절) - URL searchParams 기반
  - ✅ 실시간 검색 (제목, 수신자명, 수신자 회사 기준 - SearchInput 컴포넌트)
  - ✅ 견적서 상세 페이지 (기존 뷰 컴포넌트 재활용 + 관리자 액션 카드)
  - ✅ Notion API 직접 연동 (`getQuoteList`, `getQuoteAdmin`) - 더미 데이터 교체 완료
  - ✅ 더미 데이터 유틸리티 (`src/lib/mock/admin-data.ts`) 존재 (개발/테스트 참조용)
  - 관련 파일: `src/app/admin/(protected)/quotes/page.tsx`, `src/app/admin/(protected)/quotes/[pageId]/page.tsx`, `src/app/admin/(protected)/quotes/_components/`

---

### Phase 10: 견적서 상태 관리 ✅

- **Task-023: 견적서 상태 변경 기능 구현** ✅ - 완료
  - See: `/tasks/023-quote-status-change.md`
  - ✅ `getQuoteList()`: Notion DB 전체 조회 + 페이지네이션 + 상태 필터링 (`src/lib/notion.ts`)
  - ✅ `updateQuoteStatus(pageId, status)`: Notion pages.update PATCH 호출
  - ✅ `getQuoteAdmin(pageId)`: 관리자 전용 단건 조회 (draft 포함, 캐시 없음)
  - ✅ 상태 변경 Server Action (`changeQuoteStatus`) - requireAdmin + pageIdSchema + statusSchema Zod 검증
  - ✅ `auditLogger`로 상태 변경 감사 로그 기록 (pageId, from, to, admin email)
  - ✅ `revalidatePath` 캐시 무효화 (목록 + 상세 + 수신자 페이지)
  - ✅ 상태 변경 확인 AlertDialog (StatusChangeForm 컴포넌트)
  - 관련 파일: `src/lib/notion.ts`, `src/app/admin/(protected)/quotes/[pageId]/actions.ts`, `src/app/admin/(protected)/quotes/[pageId]/_components/status-change-form.tsx`

- **Task-024: 상태 기반 접근 제어 구현** ✅ - 완료
  - See: `/tasks/024-status-access-control.md`
  - ✅ `fetchQuoteFromNotion`에서 draft 상태 차단 (`DRAFT_ACCESS_DENIED` 에러)
  - ✅ `/quote/[pageId]`에서 DRAFT_ACCESS_DENIED 시 "견적서를 확인할 수 없습니다" 안내 표시
  - ✅ `QuoteError` 타입에 `DRAFT_ACCESS_DENIED` 추가 (`src/lib/types.ts`)
  - ✅ 관리자 상세 페이지에서 이메일/링크 버튼 비활성 상태로 UI 배치
  - 관련 파일: `src/lib/notion.ts`, `src/app/quote/[pageId]/page.tsx`, `src/lib/types.ts`

- **Task-025: 상태 관리 통합 테스트** - 대기
  - 전체 상태 변경 플로우 E2E 테스트 (draft -> sent -> accepted -> rejected)
  - 상태별 수신자 접근 제어 검증
  - 상태 변경 후 목록 반영 확인
  - `auditLogger` 감사 로그 출력 검증
  - Playwright MCP로 전체 시나리오 자동화 테스트

---

### Phase 11: 액션 콤보 버튼 (링크 복사 / 메일 전송)

- **Task-026: 액션 콤보 버튼 UI 컴포넌트 구현** - 우선순위
  - 현재 상세 페이지에 비활성 상태로 배치된 "이메일 발송", "링크 복사" 버튼을 콤보 버튼으로 교체
  - 콤보 버튼(Split Button) 컴포넌트 구현 (기본 액션 + 드롭다운 메뉴)
  - `draft` 상태 견적서는 콤보 버튼 전체 비활성화
  - shadcn/ui DropdownMenu + Button 조합으로 구현
  - 관련 파일: `src/components/ui/combo-button.tsx`, `src/app/admin/(protected)/quotes/[pageId]/page.tsx`

- **Task-027: 링크 복사 기능 구현**
  - Clipboard API (`navigator.clipboard.writeText`) 기반 링크 복사
  - 복사 대상 URL: `{NEXT_PUBLIC_BASE_URL}/quote/[pageId]`
  - 복사 완료 시 토스트 알림 표시 ("링크가 복사되었습니다")
  - `draft` 상태에서는 복사 비활성화
  - Playwright MCP로 링크 복사 기능 테스트
  - 관련 파일: `src/app/admin/(protected)/quotes/[pageId]/page.tsx`

- **Task-028: 이메일 전송 기능 구현**
  - `npm install resend` 패키지 설치
  - `src/lib/email.ts` 생성 - Resend API 클라이언트 초기화
  - 이메일 발송 Server Action (`src/app/admin/(protected)/quotes/[pageId]/actions.ts` 확장 또는 별도 파일)
    - `requireAdmin()` 가드 함수 호출 (인증 확인 필수)
    - 수신자 이메일 Zod 검증
    - 이메일 템플릿 변수 치환: `{{client_name}}`, `{{quote_title}}`, `{{quote_url}}` 등
    - 발송 성공 시 견적서 상태 자동 변경 (`draft` -> `sent`)
    - `auditLogger`로 이메일 발송 감사 로그 기록
  - 이메일 발송 확인 다이얼로그 (수신자 이메일 확인, 미리보기)
  - 발송 성공/실패 토스트 알림
  - `.env.example`에 `RESEND_API_KEY` 추가 (이미 Task-018에서 env.ts에 정의)
  - Playwright MCP로 이메일 발송 플로우 테스트 (모킹 포함)
  - 관련 파일: `src/lib/email.ts`, `src/app/admin/(protected)/quotes/[pageId]/`

---

### Phase 12: 내정보 관리

- **Task-029: 비밀번호 변경 기능 구현 (Vercel KV 기반)**
  - **기존 설계 문제점**: Vercel 환경변수(`process.env`) 직접 수정 방식은 서버리스 인스턴스 특성상 런타임 반영 불가. 각 인스턴스가 독립된 메모리를 사용하므로 한 인스턴스에서 수정해도 다른 인스턴스에는 반영되지 않음 (재배포 필요)
  - **구현 방식 변경**: Vercel KV에 새 해시 저장 → 재배포 없이 모든 인스턴스에서 즉시 새 해시 조회 가능 (ADR-001 참조)
  - `/admin/settings` 내정보 관리 페이지 라우트 생성
  - 비밀번호 변경 섹션 UI (현재 비밀번호, 새 비밀번호, 새 비밀번호 확인)
  - 비밀번호 복잡도 실시간 검증 UI (최소 8자, 대문자+소문자+숫자+특수문자 각 1개 이상, 최대 72자)
  - React Hook Form + Zod 검증 (비밀번호 보안 규칙 적용, `src/lib/schemas/auth.ts` 재활용)
  - 비밀번호 변경 Server Action 구현 (`src/app/admin/_actions/change-password.ts`)
    1. `requireAdmin()` 인증 검증
    2. 현재 비밀번호를 KV에서 해시 조회 후 `bcryptjs`로 검증 (`await getAdminPasswordHash()` → `bcrypt.compare()`)
    3. 새 비밀번호 `bcryptjs` 해싱 (SALT_ROUNDS=12)
    4. KV에 새 해시 저장 (`await setAdminPasswordHash(newHash)`) - 즉시 모든 인스턴스 반영
    5. 기존 쿠키 삭제 → `/admin/login` 리다이렉트 (재로그인 요구)
    - `securityLogger`로 비밀번호 변경 보안 이벤트 로깅
  - 변경 성공/실패 피드백 UI
  - Playwright MCP로 비밀번호 변경 플로우 테스트
  - 관련 파일: `src/app/admin/(protected)/settings/page.tsx`, `src/app/admin/(protected)/settings/actions.ts`, `src/lib/kv.ts`

- **Task-030: 이메일 발송 설정 관리 구현**
  - 이메일 발송 설정 섹션 (발신 이메일 주소, 제목 템플릿, 내용 템플릿)
  - Notion DB에 설정 데이터 저장 또는 별도 설정 저장소 구현
  - 템플릿 미리보기 기능 (변수 치환 시뮬레이션)
  - 테스트 이메일 발송 버튼
  - React Hook Form + Zod 검증 (이메일 형식 등)
  - Playwright MCP로 설정 저장 및 미리보기 테스트
  - 관련 파일: `src/app/admin/(protected)/settings/page.tsx`, `src/app/admin/(protected)/settings/actions.ts`

---

### Phase 13: 다크모드

- **Task-031: 다크모드 테마 시스템 구축**
  - `next-themes` 패키지 설치 및 ThemeProvider 설정
  - TailwindCSS v4 다크모드 CSS 변수 정의 (`globals.css`)
  - 시스템 테마 감지 및 수동 전환 지원 (system/light/dark)
  - 테마 토글 버튼 컴포넌트 구현 (헤더에 배치)
  - 관련 파일: `src/app/layout.tsx`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

- **Task-032: 전체 컴포넌트 다크모드 적용**
  - 공개 페이지 다크모드 스타일 적용 (홈, 견적서 뷰, 오류 페이지)
  - 관리자 페이지 다크모드 스타일 적용 (로그인, 목록, 설정)
  - shadcn/ui 컴포넌트 다크모드 호환 확인
  - 인쇄 시 라이트 모드 강제 적용 유지 (기존 `@media print` CSS)
  - Playwright MCP로 라이트/다크 모드 전환 스크린샷 검증
  - 관련 파일: `src/app/globals.css`, 각 페이지 컴포넌트

---

## 고도화 Phase 요약

| Phase    | 설명                           | Task 수 | Task 번호       | 상태       |
| -------- | ------------------------------ | ------- | --------------- | ---------- |
| Phase 8  | 보안 인프라 및 인증 시스템     | 4       | Task-018 ~ 020a | ✅ 완료    |
| Phase 9  | 관리자 레이아웃 및 견적서 목록 | 2       | Task-021 ~ 022  | ✅ 완료    |
| Phase 10 | 견적서 상태 관리               | 3       | Task-023 ~ 025  | 2/3 완료   |
| Phase 11 | 액션 콤보 버튼                 | 3       | Task-026 ~ 028  | 대기       |
| Phase 12 | 내정보 관리                    | 2       | Task-029 ~ 030  | 대기       |
| Phase 13 | 다크모드                       | 2       | Task-031 ~ 032  | 대기       |
| **합계** |                                | **16**  | Task-018 ~ 032  |            |
