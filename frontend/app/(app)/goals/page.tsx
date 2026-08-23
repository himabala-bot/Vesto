'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddGoalModal } from '@/components/modals/AddGoalModal';
import { ContributeGoalModal } from '@/components/modals/ContributeGoalModal';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { SavingsGoal } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GoalsPage() {
  const { currencySymbol } = useMonth();
  const { refreshTrigger, triggerRefresh } = useGlobalModal();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.goals.getAll();
      setGoals(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load savings goals');
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.goals.delete(id);
      toast.success('Savings goal deleted.');
      fetchGoals();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal');
    }
  };

  // Aggregations
  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current_amount), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const completedCount = goals.filter((g) => g.is_completed || Number(g.current_amount) >= Number(g.target_amount)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Savings Goals</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Lock money away for major milestones, emergency funds, and future plans
          </p>
        </div>

        <Button
          variant="purple"
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setIsAddModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Total Funds Saved</span>
          <div className="text-2xl font-bold text-purple-300 mt-2 tabular-nums">
            {formatCurrency(totalSaved, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all active goals</p>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Total Milestone Target</span>
          <div className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {formatCurrency(totalTarget, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Overall target sum</p>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Milestone Completion</span>
          <div className="text-2xl font-bold text-violet-300 mt-2 tabular-nums">
            {completedCount} / {goals.length} Goals
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{overallProgress}% of target funded</p>
        </Card>
      </div>

      {/* Goals Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const current = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = goal.is_completed || current >= target;

            return (
              <Card
                key={goal.id}
                className="p-6 bg-[#121218] border-[#22222e] hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#22222e]">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-white shadow-sm text-xs"
                        style={{ backgroundColor: goal.color || '#8b5cf6' }}
                      >
                        <Target className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">{goal.name}</h4>
                    </div>

                    <Badge variant={isCompleted ? 'purple' : 'neutral'}>
                      {isCompleted ? 'Completed 🎉' : `${pct}%`}
                    </Badge>
                  </div>

                  {/* Progress & Target Details */}
                  <div className="my-5 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Saved:</span>
                      <span className="text-xl font-bold text-purple-300 tabular-nums">
                        {formatCurrency(current, currencySymbol)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs text-slate-400">
                      <span>Target:</span>
                      <span className="font-semibold text-slate-200 tabular-nums">
                        {formatCurrency(target, currencySymbol)}
                      </span>
                    </div>

                    <div className="w-full bg-[#1c1c28] h-2.5 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: goal.color || '#8b5cf6',
                          width: `${pct}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>{pct}% achieved</span>
                      {goal.target_date && (
                        <span>Target: {formatDate(goal.target_date)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#22222e]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#181824] rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Button
                    variant="purple"
                    size="sm"
                    onClick={() => setContributingGoal(goal)}
                    className="text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Funds</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 bg-[#121218] border-[#22222e]">
          <EmptyState
            title="No Savings Goals Yet"
            description="Create visual milestones for emergency funds, travel, or major purchases to automatically allocate money in Safe to Spend."
            actionLabel="Create Savings Goal"
            onAction={() => {
              setEditingGoal(null);
              setIsAddModalOpen(true);
            }}
          />
        </Card>
      )}

      {/* Add / Edit Goal Modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={() => {
          fetchGoals();
          triggerRefresh();
        }}
        editGoal={editingGoal}
      />

      {/* Contribute Funds Modal */}
      <ContributeGoalModal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        onSuccess={() => {
          fetchGoals();
          triggerRefresh();
        }}
        goal={contributingGoal}
      />
    </div>
  );
}
