"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  {
    label: "Explore",
    href: "/",
    icon: (active: boolean) => (
      <svg className={cn("w-5 h-5", active ? "text-brand-olive-700" : "text-brand-gray")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    matchPaths: ["/"],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (active: boolean) => (
      <svg className={cn("w-5 h-5", active ? "text-brand-olive-700" : "text-brand-gray")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    matchPaths: ["/dashboard"],
  },
  {
    label: "Design",
    href: "/project/demo/choose",
    icon: (active: boolean) => (
      <svg className={cn("w-5 h-5", active ? "text-brand-olive-700" : "text-brand-gray")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    matchPaths: ["/project"],
    isMain: true,
  },
  {
    label: "Review",
    href: "/project/demo/presentation",
    icon: (active: boolean) => (
      <svg className={cn("w-5 h-5", active ? "text-brand-olive-700" : "text-brand-gray")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    matchPaths: ["/presentation", "/finalize"],
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.href === "/" && pathname === "/") return true;
    return item.matchPaths.some((p) => p !== "/" && pathname?.startsWith(p));
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-brand-bone-300/60 bg-white/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1 transition-colors",
                item.isMain ? "-mt-4" : "",
              )}
            >
              {item.isMain ? (
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all",
                  active
                    ? "bg-brand-olive-700 shadow-brand-olive-700/30"
                    : "bg-brand-olive-700 hover:bg-brand-olive-800"
                )}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                </div>
              ) : (
                item.icon(active)
              )}
              <span className={cn(
                "text-[10px] font-semibold",
                item.isMain ? "text-brand-olive-700 mt-0.5" : "",
                !item.isMain && active ? "text-brand-olive-700" : "",
                !item.isMain && !active ? "text-brand-gray" : "",
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
