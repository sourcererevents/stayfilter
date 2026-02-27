export function ResultSkeleton() {
  return (
    <div className="flex rounded-xl border border-zinc-200 bg-white overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-[200px] min-w-[200px] h-[150px] bg-zinc-200" />

      {/* Details placeholder */}
      <div className="flex-1 p-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 rounded w-24" />
          <div className="h-4 bg-zinc-200 rounded w-48" />
          <div className="h-3 bg-zinc-200 rounded w-32" />
        </div>
        <div className="flex items-end justify-between mt-2">
          <div className="h-4 bg-zinc-200 rounded w-16" />
          <div className="h-4 bg-zinc-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
