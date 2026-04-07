export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
          <span className="text-sm font-medium text-gray-500">Loading...</span>
        </div>
      </div>
    </div>
  );
}
