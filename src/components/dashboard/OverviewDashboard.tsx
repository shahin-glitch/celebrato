import React from 'react';
import type { EventPlan } from '../../types';
import {
  PieChart,
  Clock,
  CreditCard,
  MoreHorizontal,
  LifeBuoy,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface OverviewDashboardProps {
  event: EventPlan;
  setActiveTab: (tab: string) => void;
  openBudgetRescue: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  event,
  setActiveTab,
  openBudgetRescue,
}) => {
  const currency = event.budget.currency;
  const totalBudget = event.budget.total;
  const allocatedBudget = event.budget.categories.reduce((acc, c) => acc + c.amount, 0);
  const contingencyCat = event.budget.categories.find(
    (c) =>
      c.name.toLowerCase().includes('contingency') ||
      c.name.toLowerCase().includes('buffer') ||
      c.name.toLowerCase().includes('misc')
  );
  const contingencyAmount = contingencyCat ? contingencyCat.amount : Math.round(totalBudget * 0.05);

  const totalGuests = event.guestCount;
  const attendingGuests = event.guests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + 1 + (g.accompanyingGuests || 0), 0);

  const completedTasks = event.timeline.filter((t) => t.completed).length;
  const totalTasks = event.timeline.length;

  // Live planning feed messages matching bottom section of screenshot
  const activityMessages = [
    {
      id: 'msg-1',
      sender: 'Dr. Ramesh Shenoy (Dean)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      snippet: 'Signed open-air amphitheatre permission & generator clearance.',
      time: '2:34 pm',
      unread: true,
      tab: 'timeline',
    },
    {
      id: 'msg-2',
      sender: 'Coastal Beats Audio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      snippet: 'Stage audio & wireless mic kit reserved with power surge buffer.',
      time: '1:15 pm',
      unread: false,
      tab: 'vendors',
    },
    {
      id: 'msg-3',
      sender: 'Arjun Varma (Student Council)',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
      snippet: 'Over 185 RSVPs submitted on the student campus portal.',
      time: '11:20 am',
      unread: false,
      tab: 'guests',
    },
  ];

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-200">
      {/* Event Overview Hero Banner if rescued */}
      {event.budget.isRescued && (
        <div className="p-3.5 bg-[#F4BCE8] rounded-2xl neo-border flex items-center justify-between text-xs font-mono-code text-[#171717]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#171717]" />
            <span>
              <strong>Budget Rescue Mode Active:</strong> Scaled safely to{' '}
              {currency} {totalBudget.toLocaleString()} (Saved{' '}
              {currency}{' '}
              {((event.budget.originalTotal || totalBudget) - totalBudget).toLocaleString()}
              )
            </span>
          </div>
          <button
            onClick={() => setActiveTab('budget')}
            className="font-bold underline hover:text-black cursor-pointer"
          >
            View Breakdown →
          </button>
        </div>
      )}

      {/* TOP 4 METRIC CARDS ROW - EXACT DESIGN AS SCREENSHOT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Yellow #FDF189 */}
        <div className="bg-[#FDF189] p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full border-1.5 border-[#171717] flex items-center justify-center bg-white/40">
              <span className="font-mono-code font-bold text-sm text-[#171717]">
                {currency === 'INR' ? '₹' : '$'}
              </span>
            </div>
            <button className="text-[#171717] hover:bg-black/10 p-1 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <div className="mt-4">
            <div className="font-mono-code text-2xl lg:text-[26px] font-bold text-[#171717] tracking-tight">
              {currency === 'INR' ? '₹' : '$'}
              {totalBudget.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-[#565656] mt-0.5">
              Total planned budget
            </p>
          </div>
        </div>

        {/* Card 2: White #FFFFFF */}
        <div className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full border-1.5 border-[#171717] flex items-center justify-center bg-black/5">
              <PieChart className="w-4 h-4 text-[#171717] stroke-[2]" />
            </div>
            <button className="text-[#171717] hover:bg-black/10 p-1 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <div className="mt-4">
            <div className="font-mono-code text-2xl lg:text-[26px] font-bold text-[#171717] tracking-tight">
              {currency === 'INR' ? '₹' : '$'}
              {allocatedBudget.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-[#565656] mt-0.5">
              Allocated expenses (100%)
            </p>
          </div>
        </div>

        {/* Card 3: Mint Green #C2F2B0 */}
        <div className="bg-[#C2F2B0] p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full border-1.5 border-[#171717] flex items-center justify-center bg-white/40">
              <Clock className="w-4 h-4 text-[#171717] stroke-[2]" />
            </div>
            <button className="text-[#171717] hover:bg-black/10 p-1 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <div className="mt-4">
            <div className="font-mono-code text-2xl lg:text-[26px] font-bold text-[#171717] tracking-tight">
              {attendingGuests > 0 ? attendingGuests : 185}
              <span className="text-sm font-normal text-[#565656] ml-1">
                / {totalGuests}
              </span>
            </div>
            <p className="text-xs font-medium text-[#565656] mt-0.5">
              Confirmed guest RSVPs
            </p>
          </div>
        </div>

        {/* Card 4: Soft Lilac #E8DCF8 */}
        <div className="bg-[#E8DCF8] p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full border-1.5 border-[#171717] flex items-center justify-center bg-white/40">
              <CreditCard className="w-4 h-4 text-[#171717] stroke-[2]" />
            </div>
            <button className="text-[#171717] hover:bg-black/10 p-1 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <div className="mt-4">
            <div className="font-mono-code text-2xl lg:text-[26px] font-bold text-[#171717] tracking-tight">
              {currency === 'INR' ? '₹' : '$'}
              {contingencyAmount.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-[#565656] mt-0.5">
              Emergency buffer reserve
            </p>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: 2 STACKED METRIC CARDS + DUAL-CURVE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Two Stacked Cards with Badges (3 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: New RSVPs / Expected Guests with +12.4% badge */}
          <div className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#171717]">
                Expected Attendance
              </h4>
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono-code text-3xl font-bold text-[#171717]">
                {totalGuests}
              </span>
              <span className="font-mono-code text-xs font-bold bg-[#C2F2B0] text-[#171717] px-2 py-0.5 rounded-full neo-border">
                + 12.4%
              </span>
            </div>
            <p className="text-[11px] text-[#565656]">
              74% capacity confirmed • Venue holds 280 max
            </p>
          </div>

          {/* Card 2: Invoices overdue / Unpaid vendor milestones with -4.8% badge */}
          <div className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#171717]">
                Milestones Pending
              </h4>
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono-code text-3xl font-bold text-[#171717]">
                {totalTasks - completedTasks}
              </span>
              <span className="font-mono-code text-xs font-bold bg-[#FFC29E] text-[#171717] px-2 py-0.5 rounded-full neo-border">
                - 4.8%
              </span>
            </div>
            <p className="text-[11px] text-[#565656]">
              {completedTasks} completed • Next due in 3 days
            </p>
          </div>
        </div>

        {/* Center/Right Card: Dual-Curve Revenue / Budget Milestone Chart (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-mono-code font-bold text-base text-[#171717]">
                Budget Velocity & Milestones
              </h4>
              <p className="text-xs text-[#565656]">
                Actual expense burn VS estimated schedule
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code text-[#565656] bg-black/5 px-2.5 py-1 rounded-full">
                Phase 3 of 5
              </span>
              <button
                onClick={openBudgetRescue}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#F4BCE8] hover:bg-[#efa6e1] text-[#171717] rounded-full neo-border font-mono-code text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5"
                title="Launch Budget Rescue Mode"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Rescue</span>
              </button>
            </div>
          </div>

          {/* Dual Wavy SVG Chart matching the reference image curve */}
          <div className="relative w-full h-44 select-none">
            {/* Background Y-Axis Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono-code text-[#565656]/60 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-6">20K</span>
                <div className="h-[1px] flex-1 bg-black/5"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6">15K</span>
                <div className="h-[1px] flex-1 bg-black/5"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6">10K</span>
                <div className="h-[1px] flex-1 bg-black/5"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6">0</span>
                <div className="h-[1px] flex-1 bg-black/5"></div>
              </div>
            </div>

            {/* SVG Curved Lines */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 600 160"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill for purple curve */}
              <path
                d="M 50 110 Q 140 70 230 115 T 390 50 T 550 90 L 550 150 L 50 150 Z"
                fill="url(#purpleGrad)"
              />

              {/* Purple Curve (matching screenshot purple line) */}
              <path
                d="M 50 110 Q 140 70 230 115 T 390 50 T 550 90"
                fill="none"
                stroke="#A855F7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Green Curve (matching screenshot green line) */}
              <path
                d="M 50 85 Q 120 120 200 95 T 380 120 T 550 75"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Milestone Pin Point at apex (matching $16K pin from screenshot) */}
              <circle
                cx="390"
                cy="50"
                r="5"
                fill="white"
                stroke="#A855F7"
                strokeWidth="3"
                className="cursor-pointer"
              />
            </svg>

            {/* Floating Milestone Badge matching reference screenshot */}
            <div className="absolute top-4 left-[60%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
              <div className="bg-[#A855F7] text-white font-mono-code text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                ₹25K Audio
              </div>
              <div className="w-1.5 h-1.5 bg-[#A855F7] rotate-45 -mt-0.5"></div>
            </div>

            {/* X-Axis Dates */}
            <div className="absolute -bottom-5 left-10 right-2 flex justify-between font-mono-code text-[10px] text-[#565656]">
              <span>Oct 20</span>
              <span>Oct 28</span>
              <span>Nov 05</span>
              <span>Nov 12</span>
              <span>Nov 18</span>
              <span>Nov 20</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-6 border-t border-black/5 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span>
                <span className="text-[#565656]">Milestone target</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                <span className="text-[#565656]">Actual disbursements</span>
              </span>
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-[#171717] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              Full Budget View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: NEW MESSAGES & LIVE PLANNING ACTIVITY */}
      <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-mono-code font-bold text-base text-[#171717]">
              New Messages & Updates
            </h4>
            <span className="w-5 h-5 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center font-mono-code text-xs font-bold">
              1
            </span>
          </div>
          <span className="text-xs text-[#565656]">Updated real-time</span>
        </div>

        {/* Message Items matching screenshot list */}
        <div className="divide-y divide-black/5">
          {activityMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setActiveTab(msg.tab)}
              className="py-3 flex items-center justify-between gap-4 hover:bg-black/[0.02] -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-10 h-10 rounded-full object-cover neo-border shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#171717]">
                      {msg.sender}
                    </span>
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B6B]"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#565656] truncate mt-0.5">
                    {msg.snippet}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono-code text-xs text-[#565656]">
                  {msg.time}
                </span>
                <ChevronRight className="w-4 h-4 text-[#565656] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
