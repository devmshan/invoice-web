import { redirect } from "next/navigation";

// /admin 접근 시 견적서 목록으로 리다이렉트
export default function AdminPage() {
  redirect("/admin/quotes");
}
