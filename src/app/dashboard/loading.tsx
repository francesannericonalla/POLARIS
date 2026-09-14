export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-48 bg-gray-100 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex gap-8">
          {["Office / Department", "Branch", "Active Docs", "Last Update"].map((h) => (
            <div key={h} className="h-3 w-20 bg-gray-100 rounded" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border-b border-gray-50 px-4 py-3 flex gap-8">
            <div className="h-3 w-40 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-8 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
