export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-muted/80" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-9 w-16 animate-pulse rounded-md bg-muted/80" />
            <div className="mt-6 h-4 w-28 animate-pulse rounded-md bg-muted/60" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted/80" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted/60" />
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
