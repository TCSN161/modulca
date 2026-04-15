import MobileBottomNav from "@/features/shared/components/MobileBottomNav";
import Footer from "@/features/shared/components/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bone-100 pb-16 md:pb-0">
      {children}
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
}
