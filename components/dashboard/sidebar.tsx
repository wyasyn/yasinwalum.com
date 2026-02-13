"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CodeIcon,
  File01Icon,
  FolderIcon,
  LayoutIcon,
  LogoutIcon,
  SettingsIcon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { logoutAction } from "@/lib/actions/auth-actions";
import { clearOfflineUnlock } from "@/components/local-first/local-first-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function getInitials(email: string) {
  const local = email.split("@")[0] ?? "A";
  return local.slice(0, 2).toUpperCase();
}

type DashboardSidebarProps = {
  adminEmail: string;
};

export function DashboardSidebar({ adminEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("dashboard_sidebar_collapsed") === "1";
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("dashboard_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-r bg-muted/20 p-4 transition-[width] duration-200 md:min-h-screen",
        collapsed ? "md:w-20" : "md:w-72",
      )}
    >
      <div className="mb-6">
        <div className={cn("mb-2 flex items-center", collapsed ? "justify-center" : "justify-end")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-md border bg-background p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <HugeiconsIcon icon={collapsed ? ArrowRight01Icon : ArrowLeft01Icon} strokeWidth={2} className="h-4 w-4" />
          </button>
        </div>
        {collapsed ? (
          <p className="text-center text-xs uppercase text-muted-foreground">CMS</p>
        ) : (
          <>
            <p className="text-xs uppercase text-muted-foreground">Portfolio CMS</p>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </>
        )}
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm",
                collapsed ? "justify-center" : "gap-2",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="h-4 w-4" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-lg border bg-background py-2 text-left hover:bg-accent",
                collapsed ? "justify-center px-1" : "gap-3 px-3",
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(adminEmail)}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Admin</p>
                  <p className="truncate text-xs text-muted-foreground">{adminEmail}</p>
                </div>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form
                action={logoutAction}
                className="w-full"
                data-local-first="off"
                onSubmit={() => {
                  clearOfflineUnlock();
                }}
              >
                <button type="submit" className="flex w-full items-center gap-2 text-left">
                  <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
