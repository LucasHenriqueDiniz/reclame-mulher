"use client";



export type SubTabItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

interface SubTabsProps {
  tabs: SubTabItem[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function SubTabs({ tabs, activeTab, onChange }: SubTabsProps) {
  return (
    <div className="flex h-14 items-center gap-4 px-4 border-b border-[#26a69a1a] bg-white">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-2 py-4 bg-transparent border-none cursor-pointer -mb-px border-b-2 transition-colors ${
              isActive ? "border-[#1565C0]" : "border-transparent"
            }`}
          >
            <Icon
              size={24}
              className={isActive ? "text-[#1565C0]" : "text-[#546E7A]"}
            />
            <span
              className={`text-sm font-medium ${
                isActive ? "text-[#1565C0]" : "text-[#546E7A]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
