export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-12">
        <section className="rounded-3xl border bg-card/70 p-6 md:p-8">
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted/70" />
            <div className="h-10 w-72 animate-pulse rounded-md bg-muted/70" />
            <div className="h-5 w-96 max-w-full animate-pulse rounded-md bg-muted/60" />
            <div className="h-20 w-full animate-pulse rounded-md bg-muted/50" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="h-8 w-28 animate-pulse rounded-md bg-muted/70" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-6">
                <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted/70" />
                <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-muted/60" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded-md bg-muted/50" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
