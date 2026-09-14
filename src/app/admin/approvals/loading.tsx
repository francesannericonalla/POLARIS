export default function Loading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-64 bg-gray-100 rounded mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 flex justify-between items-center border-l-4 border-l-gray-100">
            <div>
              <div className="h-3.5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-2.5 w-40 bg-gray-100 rounded mb-1.5" />
              <div className="h-2.5 w-28 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-gray-200 rounded-lg" />
              <div className="h-7 w-14 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
