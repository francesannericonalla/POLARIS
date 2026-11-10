export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full animate-pulse">
      <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-40 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-72 bg-gray-100 rounded mb-6" />
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 flex gap-8">
          {["w-16", "w-28", "w-24", "w-32"].map((w, i) => (
            <div key={i} className={`h-2.5 ${w} bg-gray-200 rounded`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-gray-50 flex gap-8 items-center">
            <div className="h-3 w-20 bg-gray-100 rounded shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-32 bg-gray-200 rounded" />
              <div className="h-2.5 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-28 bg-gray-100 rounded-full shrink-0" />
            <div className="h-3 w-40 bg-gray-100 rounded shrink-0 hidden lg:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
