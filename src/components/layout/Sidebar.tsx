import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Wallet,
  CalendarCheck,
  Store,
  Users,
  Palette,
  FolderHeart,
  Settings,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCreateWizard: () => void;
  openSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openCreateWizard,
  openSettings,
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'AI Event Studio', icon: Sparkles, badge: 'AI' },
    { id: 'budget', label: 'Budget & Rescue', icon: Wallet },
    { id: 'timeline', label: 'Timeline & Tasks', icon: CalendarCheck },
    { id: 'vendors', label: 'Vendor Directory', icon: Store },
    { id: 'guests', label: 'Guest Manager', icon: Users },
    { id: 'themes', label: 'Themes & Inspo', icon: Palette },
    { id: 'events', label: 'All My Events', icon: FolderHeart },
  ];

  return (
    <aside className="w-full lg:w-22 bg-[#C2F2B0] neo-border-b lg:neo-border-b-0 lg:neo-border-r border-[#171717] flex lg:flex-col items-center justify-between py-4 lg:py-6 px-4 lg:px-0 select-none z-20 shrink-0">
      {/* Top Logo Glyph */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          title="Celebrato Home"
          className="w-12 h-12 bg-white rounded-2xl neo-border neo-shadow-sm flex items-center justify-center hover:scale-105 transition-transform cursor-pointer group"
        >
          {/* Custom Stylized Logo Glyph matching reference */}
          <div className="relative flex items-center justify-center">
            <span className="font-mono-code font-black text-xl text-[#171717]">C</span>
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-[#FFD95A] rounded-full border border-[#171717]"></span>
          </div>
        </button>
        <span className="hidden lg:block font-mono-code text-[10px] font-bold tracking-tight text-[#171717]">
          CELEBRATO
        </span>
      </div>

      {/* Middle Nav Items */}
      <nav className="flex lg:flex-col items-center gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center group ${
                isActive
                  ? 'bg-[#171717] text-[#C2F2B0] neo-shadow-sm scale-105'
                  : 'text-[#171717] hover:bg-black/10'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />

              {item.badge && !isActive && (
                <span className="absolute -top-1 -right-1 text-[9px] font-mono-code font-bold bg-[#FFD95A] text-[#171717] px-1 rounded-full border border-[#171717]">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on Desktop hover */}
              <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-xs font-semibold rounded-md shadow-md whitespace-nowrap pointer-events-none z-50 items-center gap-1">
                {item.label}
              </div>
            </button>
          );
        })}

        {/* Quick New Event Trigger in mobile/nav */}
        <button
          onClick={openCreateWizard}
          title="Create New Event"
          className="p-3 bg-[#FFD95A] text-[#171717] rounded-xl neo-border neo-shadow-sm hover:scale-105 transition-transform cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
        </button>
      </nav>

      {/* Bottom Settings Cog */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={openSettings}
          title="Settings & Gemini AI Key"
          className="p-3 rounded-xl text-[#171717] hover:bg-black/10 transition-colors cursor-pointer group relative"
        >
          <Settings className="w-5 h-5 stroke-[2] group-hover:rotate-45 transition-transform" />
          <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-[#171717] text-white text-xs font-semibold rounded-md shadow-md whitespace-nowrap pointer-events-none z-50">
            Settings & AI Key
          </div>
        </button>
      </div>
    </aside>
  );
};
