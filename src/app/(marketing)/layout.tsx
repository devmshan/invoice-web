import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// 마케팅 페이지용 레이아웃: Header + content + Footer
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
