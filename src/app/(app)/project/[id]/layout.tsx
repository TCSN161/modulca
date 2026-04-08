import FloatingAIButton from "@/features/consultant/components/FloatingAIButton";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingAIButton />
    </>
  );
}
