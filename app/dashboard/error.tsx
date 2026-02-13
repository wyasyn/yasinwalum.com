"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-md border p-6">
      <h2 className="text-xl font-semibold">Dashboard temporarily unavailable</h2>
      <p className="text-sm text-muted-foreground">
        The server database is unreachable right now. Local-first mode keeps your queued changes and cached data safe.
      </p>
      <p className="text-xs text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
