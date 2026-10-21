import React, { useState } from 'react';
import type { EventPlan, BudgetCategory } from '../../types';
import {
  Wallet,
  Plus,
  Trash2,
  Lock,
  Unlock,
  LifeBuoy,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface BudgetPlannerProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  openBudgetRescue: () => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  event,
  onUpdateEvent,
  openBudgetRescue,
}) => {
  const currency = event.budget.currency;
  const totalBudget = event.budget.total;
  const allocatedBudget = event.budget.categories.reduce((acc, c) => acc + c.amount, 0);
  const remaining = totalBudget - allocatedBudget;

  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState<number>(5000);

  const handleUpdateAmount = (id: string, amount: number) => {
    const updatedCategories = event.budget.categories.map((c) => {
      if (c.id === id) {
        const val = Math.max(0, amount);
        return {
          ...c,
          amount: val,
          percentage: Math.round((val / totalBudget) * 100),
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

  const handleToggleProtect = (id: string) => {
    const updatedCategories = event.budget.categories.map((c) =>
      c.id === id ? { ...c, isProtected: !c.isProtected } : c
    );
    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        categories: updatedCategories,
      },
    });
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = event.budget.categories.filter((c) => c.id !== id);
    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        categories: updatedCategories,
      },
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      amount: newCatAmount,
      percentage: Math.round((newCatAmount / totalBudget) * 100),
      reason: 'Custom user category',
      priority: 'medium',
      isProtected: false,
    };

    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        categories: [...event.budget.categories, newCat],
      },
    });
    setNewCatName('');
    setNewCatAmount(5000);
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Signature Rescue Mode Highlight Banner */}
      <div className="p-6 bg-[#F4BCE8] rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 bg-white rounded-2xl neo-border neo-shadow-sm flex items-center justify-center text-[#171717] shrink-0">
            <LifeBuoy className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono-code text-xl font-bold text-[#171717]">
                Budget Rescue Mode
              </h2>
              <span className="font-mono-code text-[10px] font-bold bg-[#171717] text-white px-2 py-0.5 rounded-full">
                Signature Feature
              </span>
            </div>
            <p className="text-xs text-[#171717]/85 mt-1 max-w-xl">
              Facing sudden budget cuts or rising vendor costs? Activate Rescue Mode to automatically
              calculate high-impact trade-offs and preserve your non-negotiables.
            </p>
          </div>
        </div>

        <button
          onClick={openBudgetRescue}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-[#FFD95A]" />
          <span>Launch Rescue Mode</span>
        </button>
      </div>

      {/* Top 3 Budget Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-code">
        <div className="bg-[#FDF189] p-5 rounded-2xl neo-border neo-shadow-sm">
          <span className="text-xs text-[#565656]">Total Planned Limit</span>
          <div className="text-2xl font-bold text-[#171717] mt-1">
            {currency} {totalBudget.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm">
          <span className="text-xs text-[#565656]">Total Allocated</span>
          <div className="text-2xl font-bold text-[#171717] mt-1">
            {currency} {allocatedBudget.toLocaleString()}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl neo-border neo-shadow-sm ${
            remaining < 0 ? 'bg-red-100' : 'bg-[#C2F2B0]'
          }`}
        >
          <span className="text-xs text-[#565656]">Remaining Balance</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              remaining < 0 ? 'text-red-700' : 'text-[#171717]'
            }`}
          >
            {currency} {remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white p-6 rounded-2xl neo-border neo-shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div>
            <h3 className="font-mono-code text-lg font-bold text-[#171717]">
              Expense Allocations
            </h3>
            <p className="text-xs text-[#565656]">
              Lock essential categories to prevent automatic cuts during Budget Rescue.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {event.budget.categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl neo-border bg-[#FCFBF7] hover:bg-white transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleProtect(cat.id)}
                    title={
                      cat.isProtected
                        ? 'Category Protected from Rescue cuts'
                        : 'Click to protect category from cuts'
                    }
                    className={`p-1.5 rounded-lg neo-border cursor-pointer transition-colors ${
                      cat.isProtected
                        ? 'bg-[#C2F2B0] text-[#171717]'
                        : 'bg-white text-gray-400 hover:text-black'
                    }`}
                  >
                    {cat.isProtected ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#171717]">
                        {cat.name}
                      </span>
                      <span className="font-mono-code text-[10px] text-[#565656] bg-black/5 px-2 py-0.5 rounded">
                        {cat.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-[#565656] mt-0.5">{cat.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono-code font-bold text-sm">
                    <span>{currency}</span>
                    <input
                      type="number"
                      value={cat.amount}
                      onChange={(e) =>
                        handleUpdateAmount(cat.id, Number(e.target.value))
                      }
                      className="w-28 px-2 py-1 bg-white border border-[#171717] rounded-lg text-right font-mono-code focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-[#565656] hover:text-red-600 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#171717] rounded-full"
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        <form
          onSubmit={handleAddCategory}
          className="p-4 bg-[#FCFBF7] rounded-xl neo-border flex flex-col sm:flex-row items-center gap-3"
        >
          <input
            type="text"
            placeholder="New Category Name (e.g. Return Gifts)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-white px-3 py-2 rounded-lg neo-border text-xs focus:outline-none"
          />
          <div className="flex items-center gap-1 font-mono-code text-xs">
            <span>{currency}</span>
            <input
              type="number"
              value={newCatAmount}
              onChange={(e) => setNewCatAmount(Number(e.target.value))}
              className="w-28 bg-white px-2 py-2 rounded-lg neo-border text-right focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white rounded-lg font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </form>
      </div>
    </div>
  );
};
