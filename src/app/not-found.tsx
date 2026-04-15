import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <span className="text-2xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>

        {/* 404 illustration */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-20 w-20 rounded-lg bg-brand-teal-100 border-2 border-brand-teal-300 flex items-center justify-center">
              <span className="text-3xl font-bold text-brand-teal-800">4</span>
            </div>
            <div className="h-20 w-20 rounded-lg bg-brand-amber-100 border-2 border-dashed border-brand-amber-400 flex items-center justify-center">
              <span className="text-2xl text-brand-amber-500">?</span>
            </div>
            <div className="h-20 w-20 rounded-lg bg-brand-teal-100 border-2 border-brand-teal-300 flex items-center justify-center">
              <span className="text-3xl font-bold text-brand-teal-800">4</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest">Module not found</p>
        </div>

        <h1 className="text-2xl font-bold text-brand-teal-800 mb-2">
          This module doesn&apos;t exist
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          The page you&apos;re looking for has been moved, removed, or never existed.
          Let&apos;s get you back to building.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-brand-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/project/new"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-brand-teal-800 hover:bg-gray-50 transition-colors"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </div>
  );
}
