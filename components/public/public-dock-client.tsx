"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  FolderIcon,
  LanguageCircleIcon,
  LayoutIcon,
  MailIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DockSocialLink = {
  id: string;
  label: string;
  href: string;
};

type PublicDockClientProps = {
  socialLinks: DockSocialLink[];
};

const HIDDEN_ROUTE_PREFIXES = [
  "/dashboard",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/offline-dashboard",
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isHiddenRoute(pathname: string) {
  return HIDDEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function SocialsDropdown({ socialLinks }: { socialLinks: DockSocialLink[] }) {
  return (
    <div className="w-64 rounded-xl border border-border bg-popover/95 p-2 shadow-md backdrop-blur-sm">
      <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Socials</p>
      {socialLinks.length === 0 ? (
        <p className="px-2 py-1 text-sm text-muted-foreground">No social links yet</p>
      ) : (
        <ul className="space-y-1">
          {socialLinks.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded px-2 py-1.5 text-sm hover:bg-muted"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PublicDockClient({ socialLinks }: PublicDockClientProps) {
  const pathname = usePathname();

  const activeIndex = useMemo(() => {
    if (isActivePath(pathname, "/")) return 0;
    if (isActivePath(pathname, "/projects")) return 1;
    if (isActivePath(pathname, "/about")) return 2;
    if (isActivePath(pathname, "/blog")) return 3;
    if (isActivePath(pathname, "/contact")) return 4;
    return -1;
  }, [pathname]);

  if (isHiddenRoute(pathname)) {
    return null;
  }

  return (
    <>
      <div className="h-28 md:h-32" />
      <nav className="fixed bottom-4 left-1/2 z-[60] w-max -translate-x-1/2 px-3">
        <TooltipProvider delayDuration={120}>
          <div className="relative flex items-end gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 shadow-lg backdrop-blur-xl max-[374px]:gap-1 max-[374px]:px-2 max-[374px]:py-1">
            <div className="relative flex items-end gap-2 [--dock-step:3.5rem] [--dock-offset:1.125rem] md:[--dock-step:4rem] md:[--dock-offset:1.375rem] max-[374px]:gap-1 max-[374px]:[--dock-step:2.75rem] max-[374px]:[--dock-offset:0.875rem]">
              <div
                className="pointer-events-none absolute bottom-0 z-0 h-0.5 w-3 rounded-full bg-primary transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(calc(${activeIndex} * var(--dock-step) + var(--dock-offset)))`,
                  opacity: activeIndex >= 0 ? 1 : 0,
                }}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    aria-label="Home"
                    aria-current={activeIndex === 0 ? "page" : undefined}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent transition duration-200 hover:bg-card/60 max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115 ${
                      activeIndex === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={LayoutIcon} className="size-5 md:size-6" strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Home</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/projects"
                    aria-label="Projects"
                    aria-current={activeIndex === 1 ? "page" : undefined}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent transition duration-200 hover:bg-card/60 max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115 ${
                      activeIndex === 1 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={FolderIcon} className="size-5 md:size-6" strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Projects</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/about"
                    aria-label="About"
                    aria-current={activeIndex === 2 ? "page" : undefined}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent transition duration-200 hover:bg-card/60 max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115 ${
                      activeIndex === 2 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={UserIcon} className="size-5 md:size-6" strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">About</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/blog"
                    aria-label="Blog"
                    aria-current={activeIndex === 3 ? "page" : undefined}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent transition duration-200 hover:bg-card/60 max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115 ${
                      activeIndex === 3 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={File01Icon} className="size-5 md:size-6" strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Blog</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/contact"
                    aria-label="Contact"
                    aria-current={activeIndex === 4 ? "page" : undefined}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent transition duration-200 hover:bg-card/60 max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115 ${
                      activeIndex === 4 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={MailIcon} className="size-5 md:size-6" strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Contact</TooltipContent>
              </Tooltip>
            </div>

            <div className="group relative ml-1 border-l border-border pl-3 max-[374px]:ml-0.5 max-[374px]:pl-2">
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 -translate-x-1/2 translate-y-2 scale-95 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                <SocialsDropdown socialLinks={socialLinks} />
              </div>
              <button
                type="button"
                aria-label="Social links"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent text-muted-foreground transition duration-200 hover:bg-card/60 hover:text-foreground max-[374px]:h-10 max-[374px]:w-10 md:h-14 md:w-14 md:hover:scale-115"
              >
                <HugeiconsIcon icon={LanguageCircleIcon} className="size-5 md:size-6" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </TooltipProvider>
      </nav>
    </>
  );
}
