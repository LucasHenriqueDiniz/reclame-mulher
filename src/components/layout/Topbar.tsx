"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  onToggleSidebar?: () => void;
}

export function Topbar({
  title,
  description,
  actions,
  className,
  onToggleSidebar,
}: TopbarProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4 px-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : null}

        <div className="flex flex-col">
          {title ? <span className="text-lg font-semibold leading-none">{title}</span> : null}
          {description ? (
            <span className="text-sm text-muted-foreground">{description}</span>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
