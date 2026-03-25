import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-brand-teal-50/30 px-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal-800 shadow-md">
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <span className="text-2xl font-bold text-brand-teal-800">
          Modul<span className="text-brand-amber-500">CA</span>
        </span>
      </Link>

      {/* Card */}
      {children}

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} ModulCA. All rights reserved.
      </p>
    </div>
  );
}
