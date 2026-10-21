import React from 'react';
import type { EventPlan } from '../../types';
import {
  FolderHeart,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface MyEventsListProps {
  events: EventPlan[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  openCreateWizard: () => void;
  onResetDemoData: () => void;
}

export const MyEventsList: React.FC<MyEventsListProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onDeleteEvent,
  openCreateWizard,
  onResetDemoData,
}) => {
  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#F4BCE8] neo-border flex items-center justify-center text-[#171717]">
              <FolderHeart className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              My Celebrations & Events
            </h2>
          </div>
          <p className="text-xs text-[#565656] mt-1">
            Switch between plans or launch new celebrations. Data is safely stored in local browser memory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDemoData}
            title="Reload initial hackathon demo events"
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#565656] hover:text-[#171717] rounded-xl neo-border font-mono-code text-xs font-bold hover:bg-black/5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Events</span>
          </button>
          <button
            onClick={openCreateWizard}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => {
          const isActive = ev.id === activeEventId;
          const completedTasks = ev.timeline.filter((t) => t.completed).length;
          const totalTasks = ev.timeline.length;
          const taskPercent =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div
              key={ev.id}
              className={`p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isActive
                  ? 'bg-[#FCFBF7] ring-2 ring-[#FFD95A] border-2 border-[#171717]'
                  : 'bg-white hover:-translate-y-1'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono-code text-[10px] font-bold uppercase bg-black/5 px-2 py-0.5 rounded text-[#565656]">
                      {ev.occasion.replace('_', ' ')}
                    </span>
                    <h3 className="font-mono-code font-bold text-base text-[#171717] mt-1">
                      {ev.name}
                    </h3>
                  </div>

                  {ev.budget.isRescued && (
                    <span className="font-mono-code text-[10px] font-bold bg-[#F4BCE8] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
                      Rescued
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-[#565656]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.date} • {ev.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ev.guestCount} Guests planned</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-code font-bold text-[#171717]">
                    <Wallet className="w-3.5 h-3.5 text-[#565656]" />
                    <span>
                      {ev.budget.currency} {ev.budget.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Task progress */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono-code text-[#565656] mb-1">
                    <span>Milestones</span>
                    <span>
                      {completedTasks}/{totalTasks} ({taskPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#171717] rounded-full"
                      style={{ width: `${taskPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                <button
                  onClick={() => onSelectEvent(ev.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-[#C2F2B0]'
                      : 'bg-[#FDF189] text-[#171717] neo-border hover:bg-[#F5E25E]'
                  }`}
                >
                  <span>{isActive ? 'Active Plan' : 'Open Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {events.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${ev.name}"?`)) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
