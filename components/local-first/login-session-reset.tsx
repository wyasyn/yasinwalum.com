"use client";

import { useEffect } from "react";

type LoginSessionResetProps = {
  loggedOut: boolean;
};

const OFFLINE_UNLOCK_KEY = "portfolio_offline_unlock";

export function LoginSessionReset({ loggedOut }: LoginSessionResetProps) {
  useEffect(() => {
    if (!loggedOut) {
      return;
    }

    window.localStorage.removeItem(OFFLINE_UNLOCK_KEY);
  }, [loggedOut]);

  return null;
}
