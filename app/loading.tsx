export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-3 pb-3">
      <div className="sticky top-3 z-20 mx-auto h-10 w-[440px] max-w-full animate-pulse rounded-br-[20px] bg-[#f6f6f6]" />

      <main className="mx-auto mt-3 max-w-[1900px]">
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="h-[58vh] min-h-[520px] animate-pulse rounded-xl bg-[#ececec] lg:h-[calc(100vh-24px)]" />

          <div className="space-y-3 pb-3 lg:pt-3">
            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <div className="h-[380px] animate-pulse rounded-xl bg-[#f6f6f6]" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-[66px] animate-pulse rounded-xl bg-[#f6f6f6]" />
                ))}
              </div>
            </div>

            <section className="space-y-3">
              <div className="h-[65px] animate-pulse rounded-xl bg-[#f6f6f6]" />
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[420px] animate-pulse rounded-xl bg-[#ececec]" />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[56px] animate-pulse rounded-xl bg-[#f6f6f6]" />
                ))}
              </div>
              <div className="h-[280px] animate-pulse rounded-xl bg-[#0e1011]" />
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
