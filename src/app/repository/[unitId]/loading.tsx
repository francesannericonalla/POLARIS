export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-32 bg-gray-100 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-36 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
