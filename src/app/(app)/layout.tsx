import MobileBottomNav from "@/features/shared/components/MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bone-100 pb-16 md:pb-0">
      {children}
      <MobileBottomNav />
    </div>
  );
}
