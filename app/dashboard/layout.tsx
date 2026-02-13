import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { LocalFirstProvider } from "@/components/local-first/local-first-provider";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <div className="md:flex">
      <DashboardSidebar adminEmail={session.user.email} />
      <main className="min-h-screen flex-1 p-4 md:p-8">{children}</main>
      <LocalFirstProvider adminEmail={session.user.email} />
    </div>
  );
}
