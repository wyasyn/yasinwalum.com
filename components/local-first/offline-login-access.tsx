"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type OfflineLoginAccessProps = {
  adminEmail: string;
};

const OFFLINE_UNLOCK_KEY = "portfolio_offline_unlock";
const OFFLINE_UNLOCK_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

function readUnlockData() {
  const raw = window.localStorage.getItem(OFFLINE_UNLOCK_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      email?: unknown;
      updatedAt?: unknown;
    };

    if (typeof parsed.email !== "string" || typeof parsed.updatedAt !== "number") {
      return null;
    }

    return {
      email: parsed.email,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function OfflineLoginAccess({ adminEmail }: OfflineLoginAccessProps) {
  const [canUseOffline, setCanUseOffline] = useState(false);

  useEffect(() => {
    function evaluate() {
      if (navigator.onLine) {
        setCanUseOffline(false);
        return;
      }

      const unlock = readUnlockData();

      if (!unlock) {
        setCanUseOffline(false);
        return;
      }

      const freshEnough = Date.now() - unlock.updatedAt < OFFLINE_UNLOCK_MAX_AGE_MS;
      const sameAdmin = unlock.email.toLowerCase() === adminEmail.toLowerCase();
      setCanUseOffline(freshEnough && sameAdmin);
    }

    evaluate();
    window.addEventListener("online", evaluate);
    window.addEventListener("offline", evaluate);

    return () => {
      window.removeEventListener("online", evaluate);
      window.removeEventListener("offline", evaluate);
    };
  }, [adminEmail]);

  if (!canUseOffline) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-md border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">
        Offline access is available from this browser based on your previous admin sign-in.
      </p>
      <Button asChild className="w-full" variant="secondary">
        <Link href="/dashboard">Continue Offline</Link>
      </Button>
    </div>
  );
}
