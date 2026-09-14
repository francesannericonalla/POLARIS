export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex gap-2 mb-5">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-3 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>
      <div className="flex justify-between items-center mb-5">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 w-16 bg-gray-100 rounded" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-gray-50 px-4 py-4 flex gap-8 items-center">
            <div className="flex-1">
              <div className="h-3 w-40 bg-gray-200 rounded mb-1.5" />
              <div className="h-2.5 w-28 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-20 bg-gray-100 rounded-md" />
            <div className="h-3 w-6 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
