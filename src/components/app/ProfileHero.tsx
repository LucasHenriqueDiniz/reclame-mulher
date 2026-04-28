import Link from "next/link";
import { MapPin, BarChart2, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTabs, type PageTabItem } from "./PageTabs";

export interface StatItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string | number;
}

interface ProfileHeroProps {
  name: string;
  city: string | null;
  state: string | null;
  avatarUrl: string | null;
  tabs: PageTabItem[];
  activeTabKey: string;
  stats?: StatItem[];
  actionButton?: {
    label: string;
    href: string;
  };
}

export function ProfileHero({
  name,
  city,
  state,
  avatarUrl,
  tabs,
  activeTabKey,
  stats = [],
  actionButton,
}: ProfileHeroProps) {
  const location = [city, state].filter(Boolean).join(", ");
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="relative overflow-hidden shadow-md border-0">
      {/* Blue Banner */}
      <div className="h-[126px] bg-[#1E88E5] rounded-t-xl" />

      {/* Avatar - overlapping banner */}
      <div className="absolute top-[58px] left-[43px] w-[137px] h-[137px] rounded-full border-4 border-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm bg-[#1E88E5]">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || "U"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-5xl font-bold font-['Poppins']">
            {initials}
          </span>
        )}
      </div>

      <div className="pt-[75px] pb-2.5 px-2.5">
        {/* User Name */}
        <div className="px-4 h-[30px] flex items-center">
          <h2 className="font-bold text-xl text-[#2A3F54] m-0">{name}</h2>
        </div>

        {/* Location, Stats, and Action Button */}
        <div className="py-2.5 px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={18} className="text-[#607D8B]" />
                <span className="text-[13px] text-[#607D8B]">{location}</span>
              </div>
            )}
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon size={18} className="text-[#607D8B]" />
                  <span className="text-[13px] text-[#607D8B]">
                    {stat.value !== undefined ? `${stat.value} ` : ""}
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>

          {actionButton && (
            <Link href={actionButton.href}>
              <Button className="h-auto px-6 py-3 rounded-xl gap-3 bg-[#1E88E5] hover:bg-[#1976D2]">
                <span className="text-sm font-medium">{actionButton.label}</span>
                <PlusSquare size={18} />
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="px-4 border-t border-[#E5E5ED]">
          <PageTabs tabs={tabs} activeTab={activeTabKey} variant="pill" />
        </div>
      </div>
    </Card>
  );
}
