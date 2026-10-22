import React from 'react';
import type { EventPlan } from '../../types';
import { Search, Plus, LifeBuoy, ChevronDown } from 'lucide-react';

interface TopHeaderProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  onSelectEvent: (eventId: string) => void;
  openCreateWizard: () => void;
  openBudgetRescue: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  openCreateWizard,
  openBudgetRescue,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#171717]/10">
      {/* Left Greeting & Event Subtitle */}
      <div>
        <h1 className="font-mono-code text-2xl lg:text-3xl font-bold tracking-tight text-[#171717]">
          Good evening, Jonathan!
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-medium text-[#565656]">
            Daily status from your celebration planner
          </p>
          <span className="text-[#565656]">•</span>
          {/* Active Event Switcher */}
          <div className="relative inline-block">
            <select
              value={activeEvent.id}
              onChange={(e) => onSelectEvent(e.target.value)}
              aria-label="Select active celebration"
              className="appearance-none bg-[#FDF189] text-[#171717] font-mono-code text-xs font-bold px-2.5 py-1 pr-6 rounded-lg neo-border cursor-pointer hover:bg-[#F5E25E] transition-colors focus:outline-none focus:ring-1 focus:ring-black"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.budget.currency} {ev.budget.total.toLocaleString()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#171717] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right Controls: Search + Budget Rescue + Create Event */}
      <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
        {/* Search Bar matching screenshot pill shape */}
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-[#565656] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search events, tasks, vendors, and guests"
            placeholder="Search anything..."
            className="w-full bg-white text-xs font-medium text-[#171717] pl-9 pr-3.5 py-2 rounded-full neo-border focus:outline-none focus:ring-2 focus:ring-[#171717]/20 placeholder:text-[#565656]"
          />
        </div>

        {/* Signature Action: Rescue My Budget */}
        <button
          onClick={openBudgetRescue}
          title="Activate Budget Rescue Mode"
          aria-label="Activate Budget Rescue Mode"
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F4BCE8] text-[#171717] rounded-full neo-border neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#EEA8DF] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <LifeBuoy className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Rescue Budget</span>
        </button>

        {/* Primary Create Event button */}
        <button
          onClick={openCreateWizard}
          aria-label="Create New Event"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] text-white rounded-full font-mono-code text-xs font-bold neo-shadow-sm hover:bg-[#2b2b2b] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Event</span>
        </button>
      </div>
    </header>
  );
};
