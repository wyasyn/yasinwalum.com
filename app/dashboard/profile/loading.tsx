export default function DashboardProfileLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/80" />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 h-5 w-36 animate-pulse rounded-md bg-muted" />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
          </div>
          <div className="h-28 animate-pulse rounded-md bg-muted/60" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
            <div className="h-10 animate-pulse rounded-md bg-muted/70" />
          </div>
          <div className="h-10 animate-pulse rounded-md bg-muted/60" />
          <div className="h-10 animate-pulse rounded-md bg-muted/60" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted/80" />
        </div>
      </div>
    </div>
  );
}
