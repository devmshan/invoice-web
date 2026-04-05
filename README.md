# Invoice Web

프리랜서와 1인 업체가 노션에 입력한 견적서를, 고객이 고유 URL로 접속해 웹에서 확인하고 PDF로 다운받을 수 있는 서비스입니다.

## 프로젝트 개요

**목적**: 노션 기반 견적서를 URL로 공유하고 PDF로 저장하는 MVP
**범위**: 견적서 발행자(프리랜서/1인 업체), 수신자(클라이언트)

## 페이지 구조

1. `/` — 홈(랜딩) 페이지: 서비스 소개 정적 페이지
2. `/quote/[pageId]` — 견적서 뷰 페이지: Notion API로 데이터 조회 후 견적서 렌더링, PDF 다운로드
3. 오류 처리: 존재하지 않는 pageId 접근 시 안내 페이지

## 핵심 기능

- Notion API 연동으로 견적서 데이터 조회
- 고유 URL을 통한 견적서 공유
- 웹 견적서 PDF 다운로드

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui (new-york style)
- **Icons**: Lucide React
- **Validation**: Zod
- **Notion**: @notionhq/client

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 모든 검사 실행 (타입체크 + 린트 + 포맷)
npm run check-all
```

## 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 로드맵](./docs/ROADMAP.md) - 개발 계획
- [개발 가이드](./CLAUDE.md) - 개발 지침
