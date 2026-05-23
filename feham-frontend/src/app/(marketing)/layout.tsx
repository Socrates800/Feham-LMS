import { Footer } from '@/components/layout/Footer';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { PageTransition } from '@/components/marketing/PageTransition';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      <main className="pt-20">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}



