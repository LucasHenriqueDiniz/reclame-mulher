"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  onSignOut?: () => Promise<void> | void;
  onProfile?: () => void;
  extraItems?: React.ReactNode;
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  onSignOut,
  onProfile,
  extraItems,
}: UserMenuProps) {
  const t = useTranslations("auth");

  const initials = useMemo(() => {
    if (!name) {
      return "?";
    }

    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }, [name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {avatarUrl ? (
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={name ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-9 w-9 rounded-full overflow-hidden">
            <BoringAvatar
              name={name || email || "User"}
              size={36}
              variant="beam"
              colors={["#3BA5FF", "#2A1B55", "#4C2D8F", "#2d8ddf", "#280F5E"]}
            />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onProfile ? (
          <DropdownMenuItem onClick={onProfile} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
        ) : null}
        {extraItems}
        {onSignOut ? <DropdownMenuSeparator /> : null}
        {onSignOut ? (
          <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
