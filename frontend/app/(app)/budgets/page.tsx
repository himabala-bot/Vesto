'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SetBudgetModal } from '@/components/modals/SetBudgetModal';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Copy, Edit2, Trash2, PieChart, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const { selectedMonth, currencySymbol } = useMonth();
  const { refreshTrigger, triggerRefresh } = useGlobalModal();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.budgets.getAll(selectedMonth);
      setBudgets(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load budgets');
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets, refreshTrigger]);

  const handleCopyPreviousMonth = async () => {
    try {
      const res = await api.budgets.copyPrevious(selectedMonth);
      toast.success(res.message || 'Budgets copied successfully!');
      fetchBudgets();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'No budgets found in previous month to copy.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this budget limit?')) return;
    try {
      await api.budgets.delete(id);
      toast.success('Budget limit removed.');
      fetchBudgets();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  // Aggregations
  const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Monthly Budgets</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Set spending guardrails for each category for {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyPreviousMonth}>
            <Copy className="h-4 w-4" />
            <span>Copy From Last Month</span>
          </Button>

          <Button
            variant="purple"
            size="sm"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Set Category Budget</span>
          </Button>
        </div>
      </div>

      {/* Overall Budget Meter Card */}
      <Card className="p-6 bg-[#121218] border-[#22222e]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Budget Utilization
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                {formatCurrency(totalSpent, currencySymbol)}
              </span>
              <span className="text-sm font-medium text-slate-400">
                spent of {formatCurrency(totalBudgeted, currencySymbol)} budgeted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {totalRemaining > 0
                ? `${formatCurrency(totalRemaining, currencySymbol)} remaining buffer across all budgeted categories.`
                : totalBudgeted > 0
                ? 'You have fully utilized your total allocated budget for this month.'
                : 'No budgets configured for this month yet.'}
            </p>
          </div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{overallPercentage}% utilized</span>
                <span>{100 - overallPercentage}% remaining</span>
              </div>
              <div className="w-full bg-[#1c1c28] h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overallPercentage > 100
                      ? 'bg-rose-500'
                      : overallPercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Budgets Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((budget) => {
            const spent = budget.spent || 0;
            const limit = Number(budget.amount);
            const remaining = budget.remaining || 0;
            const pct = budget.percentage || 0;
            const isOver = spent > limit;

            return (
              <Card
                key={budget.id}
                className="p-5 bg-[#121218] border-[#22222e] hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#22222e]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{
                          backgroundColor: budget.category_details?.color || '#8b5cf6',
                        }}
                      />
                      <h4 className="text-sm font-semibold text-slate-100">
                        {budget.category_details?.name || 'Category'}
                      </h4>
                    </div>

                    <Badge variant={isOver ? 'danger' : pct > 80 ? 'warning' : 'purple'}>
                      {isOver ? 'Exceeded' : pct > 80 ? 'Near Limit' : 'On Track'}
                    </Badge>
                  </div>

                  {/* Amounts */}
                  <div className="my-4 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Spent:</span>
                      <span className="text-base font-bold text-slate-100 tabular-nums">
                        {formatCurrency(spent, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-slate-400">
                      <span>Monthly Limit:</span>
                      <span className="font-semibold text-slate-300 tabular-nums">
                        {formatCurrency(limit, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs pt-1">
                      <span className="text-slate-400">Remaining:</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          isOver ? 'text-rose-400' : 'text-purple-300'
                        }`}
                      >
                        {isOver
                          ? `-${formatCurrency(spent - limit, currencySymbol)} over`
                          : formatCurrency(remaining, currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#1c1c28] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">{pct}% of limit used</div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-[#22222e]">
                  <button
                    onClick={() => {
                      setEditingBudget(budget);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#181824] rounded-lg transition-colors"
                    title="Edit Limit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove Budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 bg-[#121218] border-[#22222e]">
          <EmptyState
            title="No Category Budgets Set"
            description={`You have not configured budget limits for ${selectedMonth}. Allocate thresholds for dining, groceries, and entertainment to track pacing.`}
            actionLabel="Set Category Budget"
            onAction={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          />
        </Card>
      )}

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={() => {
          fetchBudgets();
          triggerRefresh();
        }}
        editBudget={editingBudget}
      />
    </div>
  );
}
