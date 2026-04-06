# Notion 데이터베이스 스키마

invoice-web에서 사용하는 노션 데이터베이스 구조 정의입니다.
**2개의 별도 데이터베이스**(`invoices`, `items`)를 사용합니다.

---

## invoices DB (견적서)

| 속성명         | 노션 속성 타입 | 설명                                    |
| -------------- | -------------- | --------------------------------------- |
| title          | Title          | 견적서 제목 (견적서 번호 포함)          |
| issue_date     | Date           | 발행일                                  |
| valid_until    | Date           | 유효기간 만료일                         |
| issuer_name    | Text           | 발행자 이름/회사명                      |
| issuer_contact | Phone          | 발행자 연락처                           |
| issuer_email   | Email          | 발행자 이메일                           |
| client_name    | Text           | 수신자 이름                             |
| client_company | Text           | 수신자 회사명                           |
| note           | Text           | 견적서 하단 메모                        |
| status         | Select         | 견적서 상태: `pending` / `accepted` / `rejected` |

---

## items DB (견적 항목)

| 속성명     | 노션 속성 타입 | 설명                          |
| ---------- | -------------- | ----------------------------- |
| title      | Title          | 항목명                        |
| invoice    | Relation       | 연결된 invoices DB 페이지     |
| quantity   | Number         | 수량                          |
| unit_price | Number         | 단가 (원)                     |
| sort_order | Number         | 항목 표시 순서 (오름차순 정렬) |

> `invoice` Relation 속성은 `invoices` DB를 참조합니다.
> `sort_order` 생략 시 노션 생성 순서를 따릅니다.

---

## 노션 Integration 설정

1. [노션 통합 설정](https://www.notion.so/my-integrations)에서 Internal Integration 생성
2. 시크릿 키 복사 → `NOTION_API_KEY`로 사용
3. `invoices` DB 페이지에서 `...` → **Connect to** → Integration 연결
4. `items` DB 페이지에서도 동일하게 Integration 연결
5. 각 DB URL에서 ID 복사 → 환경 변수에 설정

```env
NOTION_API_KEY=secret_xxxx
NOTION_DATABASE_ID=invoices_db_id
NOTION_ITEMS_DATABASE_ID=items_db_id
```

---

## 코드 매핑 (TypeScript)

```typescript
// src/lib/types.ts
type QuoteStatus = "pending" | "accepted" | "rejected";

type QuoteItem = {
  item_name: string; // items.title
  quantity: number;  // items.quantity
  unit_price: number; // items.unit_price
};

type Quote = {
  id: string;           // invoices 페이지 ID
  title: string;        // invoices.title
  issue_date: string;   // invoices.issue_date
  valid_until: string;  // invoices.valid_until
  issuer_name: string;  // invoices.issuer_name
  issuer_contact: string; // invoices.issuer_contact
  issuer_email: string;   // invoices.issuer_email
  client_name: string;    // invoices.client_name
  client_company: string; // invoices.client_company
  note: string;           // invoices.note
  status: QuoteStatus;    // invoices.status
  items: QuoteItem[];     // items DB에서 Relation 필터링
};
```

---

## API 조회 흐름

```typescript
// 1. invoices 페이지 조회
notion.pages.retrieve({ page_id: pageId })

// 2. 연결된 items 조회
notion.databases.query({
  database_id: NOTION_ITEMS_DATABASE_ID,
  filter: {
    property: "invoice",
    relation: { contains: pageId }
  },
  sorts: [{ property: "sort_order", direction: "ascending" }]
})
```
