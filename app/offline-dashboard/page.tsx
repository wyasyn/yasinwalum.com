import { OfflineDashboard } from "@/components/local-first/offline-dashboard";
import { LocalFirstProvider } from "@/components/local-first/local-first-provider";
import { env } from "@/lib/env";

export const dynamic = "force-static";

export default function OfflineDashboardPage() {
  return (
    <>
      <OfflineDashboard adminEmail={env.ADMIN_EMAIL} />
      <LocalFirstProvider adminEmail={env.ADMIN_EMAIL} />
    </>
  );
}
