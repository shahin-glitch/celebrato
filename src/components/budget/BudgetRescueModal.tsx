import React, { useState, useMemo, useEffect } from 'react';
import type { EventPlan, BudgetCategory, RescueSuggestion } from '../../types';
import {
  generateRescueSuggestions,
  calculateRebalancedCategories,
} from '../../services/budgetRescue';
import {
  LifeBuoy,
  X,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BudgetRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  onApplyRescuedPlan: (updatedEvent: EventPlan) => void;
}

export const BudgetRescueModal: React.FC<BudgetRescueModalProps> = ({
  isOpen,
  onClose,
  event,
  onApplyRescuedPlan,
}) => {
  const currentTotal = event.budget.total;
  // Default target reduced budget: 30% reduction (e.g., from 100k to 70k)
  const defaultTarget = Math.round(currentTotal * 0.7);
  const [targetBudget, setTargetBudget] = useState<number>(defaultTarget);

  // Protected categories (cannot be cut)
  const [protectedCategoryIds, setProtectedCategoryIds] = useState<string[]>(
    event.budget.categories.filter((c) => c.isProtected).map((c) => c.id)
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleCategoryProtection = (catId: string) => {
    setProtectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const budgetReductionNeeded = Math.max(0, currentTotal - targetBudget);

  // Generate intelligent suggestions based on non-protected categories
  const initialSuggestions: RescueSuggestion[] = useMemo(() => {
    return generateRescueSuggestions(event.budget.categories);
  }, [event.budget.categories]);

  const [suggestions, setSuggestions] = useState<RescueSuggestion[]>(initialSuggestions);

  const toggleSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, accepted: !s.accepted } : s))
    );
  };

  const totalSelectedSavings = suggestions
    .filter((s) => s.accepted)
    .reduce((sum, s) => sum + s.proposedSavings, 0);

  const remainingGap = Math.max(0, budgetReductionNeeded - totalSelectedSavings);
  const isGoalMet = totalSelectedSavings >= budgetReductionNeeded;

  // Calculate simulated preview categories using the exact rebalancing engine
  const previewCategories: BudgetCategory[] = useMemo(() => {
    return calculateRebalancedCategories(
      event.budget.categories,
      targetBudget,
      suggestions,
      protectedCategoryIds
    );
  }, [event.budget.categories, suggestions, targetBudget, protectedCategoryIds]);

  const handleApply = () => {
    const finalCategories = previewCategories;

    const updatedEvent: EventPlan = {
      ...event,
      budget: {
        currency: event.budget.currency,
        total: targetBudget,
        originalTotal: event.budget.originalTotal || currentTotal,
        isRescued: true,
        categories: finalCategories,
      },
    };

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onApplyRescuedPlan(updatedEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-rescue-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#FCFBF7] w-full max-w-3xl rounded-[24px] neo-border neo-shadow-lg flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#F4BCE8] p-4 sm:p-5 neo-border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white neo-border neo-shadow-sm flex items-center justify-center text-[#171717]">
              <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="budget-rescue-title" className="font-mono-code text-xl font-bold text-[#171717]">
                  Budget Rescue Mode
                </h2>
                <span className="text-[10px] font-mono-code font-bold bg-[#171717] text-white px-2 py-0.5 rounded-full">
                  AI + Deterministic
                </span>
              </div>
              <p className="text-xs text-[#171717]/80">
                Instantly adapt your celebration plan when budgets change without sacrificing core moments.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Budget Rescue Modal"
            className="p-2 hover:bg-black/10 rounded-full transition-colors cursor-pointer text-[#171717]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Step 1: Target Budget & Reduction Calculator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl neo-border">
              <span className="text-xs text-[#565656] font-medium">Original Budget</span>
              <div className="font-mono-code text-xl font-bold text-[#171717] mt-1">
                {event.budget.currency} {currentTotal.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-[#FDF189] rounded-2xl neo-border">
              <span className="text-xs text-[#171717] font-medium">New Target Budget</span>
              <div className="font-mono-code text-xl font-bold text-[#171717] mt-1 flex items-center gap-1">
                <span>{event.budget.currency}</span>
                <input
                  type="number"
                  aria-label="New Target Budget"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-white px-2 py-0.5 rounded border border-[#171717] font-mono-code text-lg font-bold focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FFC29E] rounded-2xl neo-border">
              <span className="text-xs text-[#171717] font-medium">Required Reduction</span>
              <div className="font-mono-code text-xl font-bold text-[#171717] mt-1 flex items-center gap-1.5">
                <TrendingDown className="w-5 h-5 text-[#171717]" />
                <span>
                  {event.budget.currency} {budgetReductionNeeded.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono-code text-[#565656]">Quick Presets:</span>
            {[
              { label: '-15% Drop', ratio: 0.85 },
              { label: '-30% Drop (₹70k)', ratio: 0.70 },
              { label: '-40% Drop', ratio: 0.60 },
              { label: '-50% Austere', ratio: 0.50 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTargetBudget(Math.round(currentTotal * preset.ratio))}
                aria-label={`Preset ${preset.label}`}
                className="px-2.5 py-1 text-xs font-mono-code font-bold bg-white neo-border rounded-lg hover:bg-[#FDF189] transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Step 2: Non-Negotiable Priority Locks */}
          <div className="p-4 bg-white rounded-2xl neo-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7BBF91]" />
                <h4 className="font-mono-code font-bold text-sm text-[#171717]">
                  Non-Negotiable Priorities (Protected Categories)
                </h4>
              </div>
              <span className="text-[11px] text-[#565656]">
                Click lock to protect from cuts
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.budget.categories.map((cat) => {
                const isLocked = protectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategoryProtection(cat.id)}
                    aria-label={
                      isLocked
                        ? `Unlock ${cat.name} (currently protected)`
                        : `Lock ${cat.name} to protect from cuts`
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl neo-border text-xs font-semibold transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-[#C2F2B0] text-[#171717] neo-shadow-sm font-bold'
                        : 'bg-gray-100 text-[#565656] hover:bg-gray-200'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-[#171717]" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">
                      ({event.budget.currency} {cat.amount.toLocaleString()})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Practical High-Impact Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-mono-code font-bold text-base text-[#171717]">
                  Suggested High-Impact Substitutions
                </h4>
                <p className="text-xs text-[#565656]">
                  Select recommendations to bridge the {event.budget.currency}{' '}
                  {budgetReductionNeeded.toLocaleString()} target deficit.
                </p>
              </div>
              {/* Savings Meter */}
              <div className="text-right font-mono-code">
                <div className="text-xs text-[#565656]">Savings Selected</div>
                <div
                  className={`text-sm font-bold ${
                    isGoalMet ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {event.budget.currency} {totalSelectedSavings.toLocaleString()} /{' '}
                  {budgetReductionNeeded.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  onClick={() => toggleSuggestion(sug.id)}
                  className={`p-4 rounded-2xl neo-border cursor-pointer transition-all flex items-start gap-3.5 ${
                    sug.accepted
                      ? 'bg-[#FDF189] neo-shadow-sm border-[#171717]'
                      : 'bg-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sug.accepted}
                    aria-label={`Select substitution: ${sug.title}`}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSuggestion(sug.id);
                    }}
                    className="mt-1 w-4 h-4 rounded border-[#171717] text-[#171717] cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#171717]">
                        {sug.title}
                      </span>
                      <span className="font-mono-code text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                        Saves {event.budget.currency} {sug.proposedSavings.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#565656] mt-1">{sug.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono-code text-[#171717]">
                      <span className="bg-black/5 px-2 py-0.5 rounded">
                        Category: {sug.categoryName}
                      </span>
                      <span className="bg-black/5 px-2 py-0.5 rounded">
                        Impact: {sug.impactLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Live Simulated Rebalancing Preview */}
          <div className="p-4 bg-white rounded-2xl neo-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#171717]" />
                <h4 className="font-mono-code font-bold text-sm text-[#171717]">
                  Live Allocation Preview (Before vs Rescued)
                </h4>
              </div>
              <div className="font-mono-code text-xs font-bold bg-[#C2F2B0] px-2.5 py-0.5 rounded-full neo-border">
                Sum: {event.budget.currency}{' '}
                {previewCategories.reduce((s, c) => s + c.amount, 0).toLocaleString()} (100%)
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono-code">
              {previewCategories.map((cat) => {
                const orig = event.budget.categories.find((c) => c.id === cat.id);
                const origAmt = orig ? orig.amount : cat.amount;
                const diff = cat.amount - origAmt;
                const isLocked = protectedCategoryIds.includes(cat.id);

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#FCFBF7] border border-black/5"
                  >
                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          LOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-[#565656] px-1.5 py-0.5 rounded font-bold">
                          ADAPTED
                        </span>
                      )}
                      <span className="font-sans font-semibold text-[#171717]">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 line-through text-[11px]">
                        {event.budget.currency} {origAmt.toLocaleString()}
                      </span>
                      <span className="font-bold text-[#171717]">
                        {event.budget.currency} {cat.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          diff < 0
                            ? 'text-amber-800 bg-amber-100'
                            : diff > 0
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-gray-600 bg-gray-100'
                        }`}
                      >
                        {diff === 0 ? '±0' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Status Feedback */}
          {isGoalMet ? (
            <div className="p-3.5 bg-[#C2F2B0] rounded-xl neo-border flex items-center gap-2.5 text-xs text-[#171717]">
              <CheckCircle className="w-5 h-5 text-emerald-800 shrink-0" />
              <span>
                <strong>Deficit Resolved!</strong> Your selected substitutions fully
                cover the {event.budget.currency} {budgetReductionNeeded.toLocaleString()}{' '}
                drop without compromising your locked essentials.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FFC29E] rounded-xl neo-border flex items-center gap-2.5 text-xs text-[#171717]">
              <AlertTriangle className="w-5 h-5 text-amber-900 shrink-0" />
              <span>
                Still short by <strong>{event.budget.currency} {remainingGap.toLocaleString()}</strong>.
                Select more recommendations or adjust your target budget.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white neo-border-t flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono-code font-bold text-[#565656] hover:text-[#171717] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-[#FFD95A]" />
            <span>Confirm & Apply Rescued Budget</span>
          </button>
        </div>
      </div>
    </div>
  );
};
