import React, { useState } from 'react';
import type { EventPlan } from '../../types';
import {
  Sparkles,
  Palette,
  Utensils,
  Lightbulb,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  LifeBuoy,
  Tag,
  RefreshCw,
} from 'lucide-react';

interface AiEventStudioProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  openBudgetRescue: () => void;
}

export const AiEventStudio: React.FC<AiEventStudioProps> = ({
  event,
  onUpdateEvent,
  openBudgetRescue,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'concept' | 'budget' | 'timeline' | 'vendors' | 'recommendations'>('concept');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currency = event.budget.currency;
  const totalBudget = event.budget.total;
  const allocatedSum = event.budget.categories.reduce((acc, c) => acc + c.amount, 0);
  const remainingBudget = totalBudget - allocatedSum;

  const handleUpdateCategoryAmount = (id: string, newAmount: number) => {
    const updatedCategories = event.budget.categories.map((c) => {
      if (c.id === id) {
        const amt = Math.max(0, newAmount);
        return {
          ...c,
          amount: amt,
          percentage: Math.round((amt / totalBudget) * 100),
        };
      }
      return c;
    });

    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        categories: updatedCategories,
      },
    });
  };

  const handleRebalanceBudget = () => {
    // Pro-rate categories to match totalBudget exactly
    const currentSum = event.budget.categories.reduce((acc, c) => acc + c.amount, 0);
    if (currentSum === 0) return;

    let allocated = 0;
    const rebalanced = event.budget.categories.map((c, idx) => {
      let amt: number;
      if (idx === event.budget.categories.length - 1) {
        amt = Math.max(0, totalBudget - allocated);
      } else {
        amt = Math.round((c.amount / currentSum) * totalBudget);
        allocated += amt;
      }
      return {
        ...c,
        amount: amt,
        percentage: Math.round((amt / totalBudget) * 100),
      };
    });

    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        categories: rebalanced,
      },
    });
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTimeline = event.timeline.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateEvent({
      ...event,
      timeline: updatedTimeline,
    });
  };

  const handleSimulateRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 900);
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Studio Banner */}
      <div className="p-6 bg-[#FDF189] rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-black text-[#FDF189] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              AI Event Studio
            </h2>
            <span className="font-mono-code text-[11px] font-bold bg-white text-[#171717] px-2 py-0.5 rounded-full neo-border">
              {event.concept.generatedBy === 'gemini' ? 'Google Gemini 1.5' : 'Celebrato Engine'}
            </span>
          </div>
          <p className="text-xs text-[#171717]/80 mt-1 max-w-2xl">
            Custom blueprint generated for {event.guestCount} guests in {event.location}.
            Adjust amounts and priorities to fit your vision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openBudgetRescue}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F4BCE8] text-[#171717] rounded-xl neo-border font-mono-code text-xs font-bold hover:bg-[#EEA8DF] cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Rescue Mode</span>
          </button>
          <button
            onClick={handleSimulateRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] text-white rounded-xl font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Refresh AI Plan'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#171717]/10 pb-2 overflow-x-auto">
        {[
          { id: 'concept', label: '1. Event Concept & Style', icon: Palette },
          { id: 'budget', label: '2. Intelligent Budget', icon: DollarSign },
          { id: 'timeline', label: '3. Timeline Milestones', icon: CalendarCheck },
          { id: 'vendors', label: '4. Tailored Vendor Checklist', icon: Tag },
          { id: 'recommendations', label: '5. Smart Recommendations', icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#171717] text-white neo-shadow-sm'
                  : 'bg-white text-[#565656] hover:bg-black/5 neo-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: EVENT CONCEPT */}
      {activeSubTab === 'concept' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Concept Card */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-6">
            <div>
              <span className="font-mono-code text-[11px] font-bold uppercase text-[#565656]">
                Theme Concept
              </span>
              <h3 className="font-mono-code text-2xl font-bold text-[#171717] mt-1">
                {event.concept.title}
              </h3>
              <p className="text-sm text-[#565656] mt-2 leading-relaxed">
                {event.concept.description}
              </p>
            </div>

            {/* Color Palette Swatches */}
            <div className="p-4 bg-[#FCFBF7] rounded-xl neo-border">
              <span className="text-xs font-mono-code font-bold text-[#171717]">
                Curated Color Palette
              </span>
              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                {event.concept.colorPalette.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-xl neo-border shadow-xs"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="font-mono-code text-[10px] text-[#565656] font-semibold">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decor & Styling Direction */}
            <div className="p-4 bg-white rounded-xl neo-border">
              <span className="text-xs font-mono-code font-bold text-[#171717] flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#A855F7]" /> Decor & Spatial Design
              </span>
              <p className="text-xs text-[#565656] mt-1.5 leading-relaxed">
                {event.concept.decorDirection}
              </p>
            </div>

            {/* Menu Direction */}
            <div className="p-4 bg-white rounded-xl neo-border">
              <span className="text-xs font-mono-code font-bold text-[#171717] flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#22C55E]" /> Culinary & Menu Strategy
              </span>
              <p className="text-xs text-[#565656] mt-1.5 leading-relaxed">
                {event.concept.menuDirection}
              </p>
            </div>

            {/* Suggested Activities */}
            <div>
              <span className="text-xs font-mono-code font-bold text-[#171717]">
                Suggested Key Activities & Moments
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {event.concept.suggestedActivities.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#E8DCF8]/30 rounded-xl border border-[#171717]/15 flex items-center gap-2 text-xs font-medium text-[#171717]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#171717] text-white flex items-center justify-center font-mono-code text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reasoning & Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-[#C2F2B0] rounded-2xl neo-border neo-shadow-sm">
              <h4 className="font-mono-code font-bold text-sm text-[#171717] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Why this fits your parameters
              </h4>
              <p className="text-xs text-[#171717]/85 mt-2 leading-relaxed">
                {event.concept.reasoning}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl neo-border neo-shadow-sm space-y-3 font-mono-code text-xs">
              <h4 className="font-bold text-[#171717]">Event Parameters</h4>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#565656]">Guest Count</span>
                <span className="font-bold">{event.guestCount} people</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#565656]">Budget per Guest</span>
                <span className="font-bold">
                  {currency} {Math.round(totalBudget / event.guestCount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#565656]">Atmosphere</span>
                <span className="font-bold capitalize">{event.preferences.atmosphere}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#565656]">Setting</span>
                <span className="font-bold capitalize">{event.preferences.indoorOutdoor}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INTELLIGENT BUDGET */}
      {activeSubTab === 'budget' && (
        <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <h3 className="font-mono-code text-lg font-bold text-[#171717]">
                Intelligent Budget Allocation
              </h3>
              <p className="text-xs text-[#565656]">
                All amounts are approximate planning guides and sum to your total limit.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono-code">
              <div className="text-right">
                <div className="text-[11px] text-[#565656]">Total / Remaining</div>
                <div className="text-sm font-bold">
                  {currency} {totalBudget.toLocaleString()} /{' '}
                  <span className={remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}>
                    {currency} {remainingBudget.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRebalanceBudget}
                className="px-3 py-1.5 bg-[#FDF189] text-[#171717] rounded-xl neo-border font-mono-code text-xs font-bold hover:bg-[#F5E25E] cursor-pointer"
              >
                Rebalance
              </button>
            </div>
          </div>

          {/* Allocation Categories */}
          <div className="space-y-4">
            {event.budget.categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl neo-border bg-[#FCFBF7] hover:bg-white transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717]">{cat.name}</span>
                    <span
                      className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full ${
                        cat.priority === 'high'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-100 text-[#565656]'
                      }`}
                    >
                      {cat.priority.toUpperCase()}
                    </span>
                    {cat.isProtected && (
                      <span className="text-[10px] font-mono-code bg-[#C2F2B0] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]/20">
                        PROTECTED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono-code text-xs text-[#565656]">
                      {cat.percentage}% of total
                    </span>
                    <div className="flex items-center gap-1 font-mono-code font-bold text-sm">
                      <span>{currency}</span>
                      <input
                        type="number"
                        value={cat.amount}
                        onChange={(e) =>
                          handleUpdateCategoryAmount(cat.id, Number(e.target.value))
                        }
                        className="w-24 px-2 py-1 bg-white border border-[#171717] rounded-lg text-right font-mono-code focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#565656] mt-2">{cat.reason}</p>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#171717] rounded-full transition-all"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TIMELINE MILESTONES */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div>
              <h3 className="font-mono-code text-lg font-bold text-[#171717]">
                Milestone Schedule
              </h3>
              <p className="text-xs text-[#565656]">
                Sequential checklist leading up to {event.date}
              </p>
            </div>
            <span className="font-mono-code text-xs text-[#565656]">
              {event.timeline.filter((t) => t.completed).length}/{event.timeline.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {event.timeline.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-xl neo-border flex items-start gap-3 cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-[#C2F2B0]/30 border-black/30'
                    : 'bg-[#FCFBF7] hover:bg-white neo-shadow-sm'
                }`}
              >
                <div className="mt-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#171717] bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-bold text-sm ${
                        task.completed ? 'line-through text-[#565656]' : 'text-[#171717]'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="font-mono-code text-xs text-[#565656] shrink-0">
                      Due: {task.dueDate}
                    </span>
                  </div>
                  {task.notes && (
                    <p className="text-xs text-[#565656] mt-1">{task.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 font-mono-code text-[10px]">
                    <span className="bg-black/5 px-2 py-0.5 rounded text-[#171717]">
                      {task.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-[#565656]'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TAILORED VENDOR CHECKLIST */}
      {activeSubTab === 'vendors' && (
        <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-4">
          <div className="pb-3 border-b border-black/10">
            <h3 className="font-mono-code text-lg font-bold text-[#171717]">
              Tailored Vendor Procurement Checklist
            </h3>
            <p className="text-xs text-[#565656]">
              Key categories with target budget bands and suggested interview questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.vendorChecklist.map((vc) => (
              <div key={vc.id} className="p-4 rounded-xl neo-border bg-[#FCFBF7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#171717]">{vc.category}</span>
                  <span className="text-[10px] font-mono-code font-bold uppercase bg-[#FDF189] px-2 py-0.5 rounded-full border border-[#171717]">
                    {vc.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#565656]">{vc.reason}</p>

                <div className="p-2.5 bg-white rounded-lg border border-[#171717]/15 font-mono-code text-xs">
                  <div className="text-[10px] text-[#565656]">Target Budget Band</div>
                  <div className="font-bold text-[#171717]">
                    {currency} {vc.estimatedMin.toLocaleString()} - {currency}{' '}
                    {vc.estimatedMax.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#565656] mt-1">
                    Book by: <strong>{vc.bookingDeadline}</strong>
                  </div>
                </div>

                {vc.assignedVendorName && (
                  <div className="text-xs bg-[#C2F2B0]/40 p-2 rounded-lg border border-[#171717]/15">
                    <strong>Assigned:</strong> {vc.assignedVendorName}
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-mono-code font-bold text-[#171717]">
                    Questions to Ask:
                  </span>
                  <ul className="list-disc list-inside text-xs text-[#565656] mt-1 space-y-0.5">
                    {vc.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RECOMMENDATIONS */}
      {activeSubTab === 'recommendations' && (
        <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-4">
          <div className="pb-3 border-b border-black/10">
            <h3 className="font-mono-code text-lg font-bold text-[#171717]">
              Personalized Recommendations & Alternatives
            </h3>
            <p className="text-xs text-[#565656]">
              Actionable tips to maximize value, prepare for weather, and reduce expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl neo-border bg-[#FCFBF7] space-y-2 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rec.type === 'low_cost'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : rec.type === 'weather'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}
                  >
                    {rec.type.replace('_', ' ')}
                  </span>
                  {rec.estimatedSavings > 0 && (
                    <span className="font-mono-code text-xs font-bold text-emerald-700">
                      Saves ~{currency} {rec.estimatedSavings.toLocaleString()}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#171717]">{rec.title}</h4>
                <p className="text-xs text-[#565656] leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
