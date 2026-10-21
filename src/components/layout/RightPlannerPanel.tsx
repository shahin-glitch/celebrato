import React, { useState } from 'react';
import type { EventPlan, TimelineTask } from '../../types';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RightPlannerPanelProps {
  event: EventPlan;
  onToggleTask: (taskId: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onSelectDate?: (dateStr: string) => void;
}

export const RightPlannerPanel: React.FC<RightPlannerPanelProps> = ({
  event,
  onToggleTask,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  // Calendar state based on event date or current month
  const eventDateObj = new Date(event.date);
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(eventDateObj.getTime()) ? 10 : eventDateObj.getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(eventDateObj.getTime()) ? 2026 : eventDateObj.getFullYear()
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days for the currentMonth
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
    });
  }
  // Next month leading days to complete grid
  const remaining = 35 - calendarCells.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      calendarCells.push({
        day: i,
        isCurrentMonth: false,
      });
    }
  }

  // Check event day highlight
  const isTargetMonth =
    !isNaN(eventDateObj.getTime()) &&
    eventDateObj.getMonth() === currentMonth &&
    eventDateObj.getFullYear() === currentYear;
  const eventDayNumber = isTargetMonth ? eventDateObj.getDate() : 20;

  // Key highlight days matching visual reference (12, 17, 28)
  const highlightedDays = {
    yellow: 17,
    mint: 12,
    purple: eventDayNumber,
  };

  // Time-slot tasks for the right panel timeline
  const scheduledTasks = [
    {
      id: event.timeline[0]?.id || 'sched-1',
      timeSlot: '06:20 - 07:20',
      timeMark: '06:00',
      title: 'Sound Check & Stage Setup',
      category: 'Venue & Audio',
      color: 'bg-[#C2F2B0]', // Mint green pill from screenshot
      completed: event.timeline[0]?.completed || false,
    },
    {
      id: event.timeline[1]?.id || 'sched-2',
      timeSlot: '07:40 - 08:20',
      timeMark: '07:30',
      title: 'Council & Dean Walkthrough',
      category: 'VIP Meeting',
      color: 'bg-[#FDF189]', // Butter yellow pill from screenshot
      completed: event.timeline[1]?.completed || true,
    },
    {
      id: event.timeline[2]?.id || 'sched-3',
      timeSlot: '09:10 - 09:40',
      timeMark: '09:00',
      title: 'Catering & Snack Counter Check',
      category: 'Refreshments',
      color: 'bg-[#E8DCF8]', // Lilac pill from screenshot
      completed: event.timeline[2]?.completed || false,
      hasTimelineBar: true, // Purple indicator line
    },
  ];

  return (
    <aside className="w-full lg:w-[320px] bg-[#E3FFA8] neo-border-t lg:neo-border-t-0 lg:neo-border-l border-[#171717] p-5 flex flex-col justify-between shrink-0 select-none">
      {/* Top Header Icons Row matching reference image */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-[#171717]/15">
          <div className="flex items-center gap-3 text-[#171717]">
            <button
              title="Calendar"
              className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              title="Team Chat"
              className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              onClick={onOpenNotifications}
              title="Notifications"
              className="p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF6B6B] rounded-full border border-[#171717]"></span>
              )}
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2">
            <div className="relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Jonathan Miller"
                className="w-10 h-10 rounded-full object-cover neo-border"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#C2F2B0] rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>

        {/* Calendar Widget matching reference image */}
        <div className="mt-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono-code font-bold text-base text-[#171717]">
              {monthNames[currentMonth]}, {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-black/10 rounded-md transition-colors cursor-pointer text-[#171717]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-black/10 rounded-md transition-colors cursor-pointer text-[#171717]"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center font-mono-code text-[11px] font-semibold text-[#565656] mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center font-mono-code text-xs">
            {calendarCells.map((cell, idx) => {
              const isYellow = cell.isCurrentMonth && cell.day === highlightedDays.yellow;
              const isMint = cell.isCurrentMonth && cell.day === highlightedDays.mint;
              const isPurple = cell.isCurrentMonth && cell.day === highlightedDays.purple;

              let highlightClass = 'text-[#171717]';
              if (!cell.isCurrentMonth) {
                highlightClass = 'text-[#565656]/40';
              } else if (isPurple) {
                // Purple circle matching reference day 28
                highlightClass =
                  'bg-transparent border-2 border-[#A855F7] text-[#171717] font-bold rounded-full';
              } else if (isMint) {
                // Mint circle matching reference day 12
                highlightClass =
                  'bg-transparent border-2 border-[#171717] bg-[#C2F2B0] text-[#171717] font-bold rounded-full';
              } else if (isYellow) {
                // Yellow circle matching reference day 17
                highlightClass =
                  'bg-transparent border-2 border-[#171717] text-[#171717] font-bold rounded-full';
              }

              return (
                <div
                  key={idx}
                  className="flex items-center justify-center h-7 w-7 mx-auto cursor-pointer"
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 ${highlightClass}`}
                  >
                    {cell.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* My To-Do list Section matching reference image */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono-code font-bold text-base text-[#171717]">
              My To-Do list
            </h3>
            <span className="text-[11px] font-mono-code text-[#565656] bg-black/5 px-2 py-0.5 rounded-full">
              {event.timeline.filter((t) => t.completed).length}/{event.timeline.length} done
            </span>
          </div>

          {/* Timeline schedule grid with horizontal time markings */}
          <div className="relative space-y-4 pt-2">
            {/* Background Time Lines */}
            <div className="space-y-4 font-mono-code text-[11px] text-[#565656]">
              {['06:00', '06:30', '07:30', '08:00', '08:30', '09:00', '09:30', '10:30'].map(
                (time) => (
                  <div key={time} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 text-left">{time}</span>
                    <div className="h-[1px] flex-1 bg-black/10"></div>
                  </div>
                )
              )}
            </div>

            {/* Overlaid Event Task Cards matching reference design */}
            <div className="absolute top-1 left-12 right-0 space-y-2 pointer-events-auto">
              {scheduledTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-2.5 rounded-xl neo-border cursor-pointer transition-transform hover:-translate-y-0.5 neo-shadow-sm ${task.color}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[#171717] truncate">
                      {task.title}
                    </span>
                    {task.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#171717] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#171717] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono-code text-[10px] text-[#171717]/80">
                    <Clock className="w-3 h-3" />
                    <span>{task.timeSlot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quick Status / AI badge */}
      <div className="pt-4 border-t border-[#171717]/15 flex items-center justify-between text-xs font-mono-code text-[#565656]">
        <span className="flex items-center gap-1 text-[#171717] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#805AD5]" /> Celebrato AI Active
        </span>
        <span className="text-[11px]">{event.guestCount} Guests</span>
      </div>
    </aside>
  );
};
