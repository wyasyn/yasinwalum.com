export default function DashboardSocialsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted/80" />
        </div>
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-md bg-muted" />
        <div className="space-y-3">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/60" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-3">
              <div className="h-5 animate-pulse rounded-md bg-muted/80" />
              <div className="h-5 animate-pulse rounded-md bg-muted/70" />
              <div className="h-5 animate-pulse rounded-md bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
