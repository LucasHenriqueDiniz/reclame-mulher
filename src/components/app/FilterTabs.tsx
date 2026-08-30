"use client";


export type FilterTabItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
};

interface FilterTabsProps {
  tabs: FilterTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  mutedColor?: string;
}

export function FilterTabs({ tabs, activeTab, onChange, mutedColor = "#607D8B" }: FilterTabsProps) {
  return (
    <nav className="flex h-14 items-center gap-4 bg-white border-b border-[#26a69a1a] px-4">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-2 py-4 self-stretch flex-[0_0_auto] border-b-2 cursor-pointer transition-colors -mb-px ${
              isActive
                ? "border-[#1E88E5]"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <IconComponent
              className="w-6 h-6"
              style={{ color: isActive ? tab.color : mutedColor }}
            />
            <span
              className="font-['Poppins'] font-medium text-sm"
              style={{ color: isActive ? tab.color : mutedColor }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
