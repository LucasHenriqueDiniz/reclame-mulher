"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";

export interface SidebarNavItem {
  label: ReactNode;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface SidebarProps {
  header?: ReactNode;
  footer?: ReactNode;
  items: SidebarNavItem[];
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ header, footer, items, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {header ? <div className="border-b px-4 py-4">{header}</div> : null}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Button
                key={String(item.href)}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                asChild
                onClick={onNavigate}
              >
                <Link href={item.href} className="flex w-full items-center gap-3">
                  {item.icon ? <span className="text-muted-foreground">{item.icon}</span> : null}
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge ? <span className="text-xs text-muted-foreground">{item.badge}</span> : null}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      {footer ? <div className="border-t px-4 py-4 text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
