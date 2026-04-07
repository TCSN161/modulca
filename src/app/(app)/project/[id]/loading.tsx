export default function StepLoading() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header skeleton */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
        <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-3 w-10 rounded bg-gray-100 animate-pulse hidden md:block" />
          ))}
        </div>
        <div className="h-8 w-16 rounded-lg bg-gray-200 animate-pulse" />
      </header>

      {/* Body skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar skeleton */}
        <aside className="w-72 border-r border-gray-200 bg-white p-5 hidden md:block shrink-0">
          <div className="h-6 w-40 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="h-4 w-56 rounded bg-gray-100 animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
              <span className="text-sm font-medium text-gray-400">Loading step...</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
