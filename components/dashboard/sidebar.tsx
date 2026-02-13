"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
  File01Icon,
  FolderIcon,
  LayoutIcon,
  SettingsIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutIcon },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  { href: "/dashboard/skills", label: "Skills", icon: CodeIcon },
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon },
  { href: "/dashboard/blog", label: "Blog", icon: File01Icon },
  { href: "/dashboard/socials", label: "Socials", icon: SettingsIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r bg-muted/20 p-4 md:min-h-screen md:w-64">
      <div className="mb-6">
        <p className="text-xs uppercase text-muted-foreground">Portfolio CMS</p>
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="mt-8">
        <Button type="submit" variant="outline" className="w-full">
          Sign Out
        </Button>
      </form>
    </aside>
  );
}
