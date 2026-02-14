export default function EditPostLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-200">
      <div className="space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted/80" />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-md bg-muted/70" />
          <div className="h-10 animate-pulse rounded-md bg-muted/70" />
          <div className="h-40 animate-pulse rounded-md bg-muted/60" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted/80" />
        </div>
      </div>
    </div>
  );
}
