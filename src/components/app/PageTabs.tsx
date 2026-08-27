
import Link from "next/link";

export type PageTabItem = {
  key: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface PageTabsProps {
  tabs: PageTabItem[];
  activeTab: string;
  variant?: "underline" | "pill";
  className?: string;
}

export function PageTabs({ tabs, activeTab, variant = "underline", className = "" }: PageTabsProps) {
  if (variant === "pill") {
    return (
      <div className={`flex gap-4 flex-wrap ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1.5 py-4 px-2 no-underline border-b-2 -mb-px transition-colors ${
                isActive ? "border-[#1565C0]" : "border-transparent"
              }`}
            >
              {Icon && <Icon className={isActive ? "text-[#1565C0]" : "text-[#546E7A]"} />}
              <span className={`text-sm font-medium ${isActive ? "text-[#1565C0]" : "text-[#546E7A]"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className={`flex items-center gap-1 border-b border-[#E5E5ED] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? "border-[#1565C0] text-[#1565C0]"
                : "border-transparent text-[#546E7A] hover:text-[#2A3F54]"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
