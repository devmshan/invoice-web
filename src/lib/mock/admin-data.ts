import type { Quote, QuoteStatus } from "@/lib/types";

// 관리자 페이지용 더미 견적서 데이터 (Phase 10에서 Notion API로 교체 예정)
export const mockQuotes: Quote[] = [
  {
    id: "a1b2c3d4-e5f6-4789-abcd-ef1234567890",
    title: "웹사이트 리뉴얼 프로젝트",
    issue_date: "2026-03-01",
    valid_until: "2026-04-30",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "김철수",
    client_company: "(주)테크스타트",
    note: "디자인 3회 수정 포함",
    status: "draft",
    items: [
      { item_name: "UI/UX 디자인", quantity: 1, unit_price: 2000000 },
      { item_name: "프론트엔드 개발", quantity: 1, unit_price: 3000000 },
    ],
  },
  {
    id: "b2c3d4e5-f6a7-4890-bcde-f01234567891",
    title: "모바일 앱 MVP 개발",
    issue_date: "2026-03-05",
    valid_until: "2026-05-05",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "이영희",
    client_company: "스타트업코리아",
    note: "iOS/Android 동시 지원, React Native 기반",
    status: "draft",
    items: [
      { item_name: "기획 및 와이어프레임", quantity: 1, unit_price: 1500000 },
      { item_name: "React Native 개발", quantity: 1, unit_price: 5000000 },
      { item_name: "QA 테스트", quantity: 1, unit_price: 800000 },
    ],
  },
  {
    id: "c3d4e5f6-a7b8-4901-cdef-012345678902",
    title: "쇼핑몰 백엔드 API 개발",
    issue_date: "2026-03-10",
    valid_until: "2026-04-10",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "박민준",
    client_company: "(주)온라인커머스",
    note: "결제 연동 포함 (토스페이먼츠)",
    status: "sent",
    items: [
      { item_name: "REST API 설계 및 개발", quantity: 1, unit_price: 4000000 },
      { item_name: "결제 시스템 연동", quantity: 1, unit_price: 1500000 },
    ],
  },
  {
    id: "d4e5f6a7-b8c9-4012-defa-123456789013",
    title: "기업 인트라넷 포털 구축",
    issue_date: "2026-03-15",
    valid_until: "2026-04-15",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "최지원",
    client_company: "(주)대한제조",
    note: "사내 SSO 연동 필요, 50명 동시 접속 기준",
    status: "sent",
    items: [
      { item_name: "요구사항 분석 및 설계", quantity: 1, unit_price: 2000000 },
      { item_name: "포털 개발", quantity: 1, unit_price: 6000000 },
      { item_name: "배포 및 운영 가이드", quantity: 1, unit_price: 500000 },
    ],
  },
  {
    id: "e5f6a7b8-c9d0-4123-efab-234567890124",
    title: "브랜드 랜딩페이지 제작",
    issue_date: "2026-02-20",
    valid_until: "2026-03-20",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "정수현",
    client_company: "뷰티브랜드코",
    note: "영문/한국어 이중 언어 지원",
    status: "accepted",
    items: [
      { item_name: "디자인 시안", quantity: 3, unit_price: 500000 },
      { item_name: "HTML/CSS 퍼블리싱", quantity: 1, unit_price: 1200000 },
    ],
  },
  {
    id: "f6a7b8c9-d0e1-4234-fabc-345678901235",
    title: "ERP 시스템 커스터마이징",
    issue_date: "2026-02-25",
    valid_until: "2026-03-25",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "강동훈",
    client_company: "(주)글로벌물류",
    note: "기존 ERP 연동 및 모듈 추가 개발",
    status: "accepted",
    items: [
      { item_name: "현행 시스템 분석", quantity: 1, unit_price: 1000000 },
      { item_name: "모듈 개발", quantity: 2, unit_price: 3000000 },
      { item_name: "데이터 마이그레이션", quantity: 1, unit_price: 1500000 },
    ],
  },
  {
    id: "a7b8c9d0-e1f2-4345-abcd-456789012346",
    title: "데이터 시각화 대시보드",
    issue_date: "2026-02-10",
    valid_until: "2026-03-10",
    issuer_name: "홍길동",
    issuer_contact: "010-1234-5678",
    issuer_email: "hong@example.com",
    client_name: "윤서연",
    client_company: "(주)데이터인사이트",
    note: "예산 범위 초과로 재협의 필요",
    status: "rejected",
    items: [
      { item_name: "데이터 파이프라인 구축", quantity: 1, unit_price: 3000000 },
      { item_name: "대시보드 개발 (React)", quantity: 1, unit_price: 4000000 },
    ],
  },
];

// 필터 조건에 따라 견적서 목록 반환
export function getMockQuotes(filters?: {
  status?: QuoteStatus;
  search?: string;
}): Quote[] {
  let result = [...mockQuotes];

  if (filters?.status) {
    result = result.filter((q) => q.status === filters.status);
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (q) =>
        q.title.toLowerCase().includes(s) ||
        q.client_name.toLowerCase().includes(s) ||
        q.client_company.toLowerCase().includes(s),
    );
  }

  return result;
}

// 특정 ID의 견적서 반환
export function getMockQuote(pageId: string): Quote | undefined {
  return mockQuotes.find((q) => q.id === pageId);
}
