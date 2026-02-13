import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { LocalFirstProvider } from "@/components/local-first/local-first-provider";
import { env } from "@/lib/env";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:flex">
      <DashboardSidebar adminEmail={env.ADMIN_EMAIL} />
      <main className="min-h-screen flex-1 p-4 md:p-8">{children}</main>
      <LocalFirstProvider adminEmail={env.ADMIN_EMAIL} />
    </div>
  );
}
