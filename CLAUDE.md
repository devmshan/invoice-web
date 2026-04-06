# 🤖 Claude Code 개발 지침

**invoice-web**은 프리랜서/1인 업체가 노션 견적서를 고유 URL로 공유하고 PDF로 다운로드할 수 있게 해주는 Next.js 기반 서비스입니다.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Development**: ESLint + Prettier + Husky + lint-staged

## 📚 개발 가이드

- **🗺️ 개발 로드맵**: `@/docs/ROADMAP.md`
- **📋 프로젝트 요구사항**: `@/docs/PRD.md`
- **📁 프로젝트 구조**: `@/docs/guides/project-structure.md`
- **🎨 스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **🧩 컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **⚡ Next.js 15.5.3 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **📝 폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`
- **🗄️ Notion DB 스키마**: `@/docs/guides/notion-schema.md`

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ⚠️ 구현 및 수정 시 필수 사항

**파일 수정 후 반드시 린터와 포맷 검사를 실행해야 합니다.**

```bash
npm run check-all   # lint + format + type 검사 통합 실행 (필수)
```

- 구현 중 파일을 수정할 때마다 실행
- 에러가 있으면 다음 단계로 넘어가지 말 것
- 포맷 오류는 `npm run format`으로 자동 수정 가능

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
