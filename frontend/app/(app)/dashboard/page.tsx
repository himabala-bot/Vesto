'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/auth-context';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { DashboardMetrics, SavingsGoal, RecurringExpense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { ContributeGoalModal } from '@/components/modals/ContributeGoalModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedMonth, setCurrencySymbol } = useMonth();
  const { openAddTransaction, refreshTrigger, triggerRefresh } = useGlobalModal();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSafeBreakdown, setShowSafeBreakdown] = useState<boolean>(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.analytics.getDashboard(selectedMonth);
      setMetrics(data);
      if (data.currency_symbol) {
        setCurrencySymbol(data.currency_symbol);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, setCurrencySymbol]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const handleLogRecurringPayment = async (recurringId: number) => {
    try {
      const res = await api.recurring.logPayment(recurringId);
      toast.success(res.message || 'Payment logged successfully!');
      fetchDashboardData();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to log recurring payment');
    }
  };

  const currencySymbol = metrics?.currency_symbol || '$';

  if (isLoading && !metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Calculating Safe to Spend metrics...</p>
        </div>
      </div>
    );
  }

  const safe = metrics?.safe_to_spend;
  const isNewUser = !metrics?.has_data && (metrics?.safe_to_spend?.status === 'unconfigured');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Hello, {user?.first_name || user?.username}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Here is your financial status for <span className="text-purple-300 font-medium">{metrics?.month_label}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="purple" size="sm" onClick={openAddTransaction}>
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Onboarding checklist for new users */}
      {isNewUser && (
        <Card className="border-purple-500/30 bg-purple-950/10 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-100">
                Welcome to Vesto! Let’s configure your Safe to Spend engine.
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your dashboard starts fresh with zero fake data. Complete these 3 quick steps to calculate your exact daily safe spending allowance:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div
                  onClick={openAddTransaction}
                  className="p-3 rounded-xl bg-[#121218] border border-[#22222e] hover:border-purple-500/40 cursor-pointer transition-colors group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 flex items-center gap-1.5">
                    1. Record Income
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Add your paycheck or monthly income.</p>
                </div>

                <Link
                  href="/recurring"
                  className="p-3 rounded-xl bg-[#121218] border border-[#22222e] hover:border-purple-500/40 transition-colors group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 flex items-center gap-1.5">
                    2. Add Fixed Bills
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Rent, utilities & recurring subscriptions.</p>
                </Link>

                <Link
                  href="/goals"
                  className="p-3 rounded-xl bg-[#121218] border border-[#22222e] hover:border-purple-500/40 transition-colors group"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 flex items-center gap-1.5">
                    3. Set Savings Goal
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Lock away emergency funds.</p>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Hero Safe to Spend Spotlight */}
      <Card
        className={`p-6 sm:p-8 relative overflow-hidden transition-all ${
          safe?.status === 'on_track'
            ? 'border-purple-500/40 safe-glow-purple bg-gradient-to-br from-[#121218] via-[#141420] to-purple-950/20'
            : safe?.status === 'caution'
            ? 'border-amber-500/40 safe-glow-amber bg-gradient-to-br from-[#121218] via-[#141420] to-amber-950/20'
            : safe?.status === 'exceeded'
            ? 'border-rose-500/40 safe-glow-rose bg-gradient-to-br from-[#121218] via-[#141420] to-rose-950/20'
            : 'border-[#22222e] bg-[#121218]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Safe to Spend Engine
              </span>
              <Badge
                variant={
                  safe?.status === 'on_track'
                    ? 'purple'
                    : safe?.status === 'caution'
                    ? 'warning'
                    : safe?.status === 'exceeded'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {safe?.status === 'on_track' && <CheckCircle2 className="h-3 w-3" />}
                {safe?.status === 'caution' && <AlertTriangle className="h-3 w-3" />}
                {safe?.status === 'exceeded' && <AlertTriangle className="h-3 w-3" />}
                <span>
                  {safe?.status === 'on_track'
                    ? 'On Track'
                    : safe?.status === 'caution'
                    ? 'Caution'
                    : safe?.status === 'exceeded'
                    ? 'Limit Reached'
                    : 'Ready to Configure'}
                </span>
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white tabular-nums">
                {formatCurrency(safe?.safe_daily, currencySymbol)}
              </span>
              <span className="text-sm sm:text-base font-medium text-slate-400">/ day safe allowance</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {safe?.message || 'Add income to compute your safe daily spending allowance.'}
            </p>
          </div>

          {/* Quick Metrics & Toggle Breakdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="rounded-2xl bg-[#0b0b10] p-4 border border-[#22222e] text-center sm:text-left min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400">This Week</span>
              <div className="text-xl font-bold text-slate-100 mt-0.5 tabular-nums">
                {formatCurrency(safe?.safe_weekly, currencySymbol)}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0b0b10] p-4 border border-[#22222e] text-center sm:text-left min-w-[140px]">
              <span className="text-[11px] font-medium text-slate-400">Month Remaining</span>
              <div className="text-xl font-bold text-purple-300 mt-0.5 tabular-nums">
                {formatCurrency(safe?.safe_month, currencySymbol)}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSafeBreakdown(!showSafeBreakdown)}
              className="text-xs"
            >
              <Info className="h-3.5 w-3.5" />
              <span>{showSafeBreakdown ? 'Hide Math' : 'How It’s Calculated'}</span>
            </Button>
          </div>
        </div>

        {/* Expandable Formula Math breakdown */}
        {showSafeBreakdown && (
          <div className="mt-6 pt-6 border-t border-[#22222e] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs animate-in fade-in-50 duration-200">
            <div className="p-3 rounded-xl bg-[#0b0b10]/60 border border-[#22222e]">
              <span className="text-slate-400">1. Effective Income</span>
              <div className="text-sm font-semibold text-purple-300 mt-1 tabular-nums">
                +{formatCurrency(safe?.effective_income, currencySymbol)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b10]/60 border border-[#22222e]">
              <span className="text-slate-400">2. Committed Bills</span>
              <div className="text-sm font-semibold text-rose-400 mt-1 tabular-nums">
                -{formatCurrency(safe?.committed_recurring, currencySymbol)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b10]/60 border border-[#22222e]">
              <span className="text-slate-400">3. Savings Goal Lock</span>
              <div className="text-sm font-semibold text-violet-300 mt-1 tabular-nums">
                -{formatCurrency(safe?.savings_target, currencySymbol)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0b10]/60 border border-[#22222e]">
              <span className="text-slate-400">4. Spent So Far</span>
              <div className="text-sm font-semibold text-amber-400 mt-1 tabular-nums">
                -{formatCurrency(safe?.total_spent, currencySymbol)}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All-Time Balance */}
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Lifetime Balance</span>
            <IndianRupee className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {formatCurrency(metrics?.all_time_balance, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Net of all historical income & expenses</p>
        </Card>

        {/* Month Income */}
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Month Income</span>
            <ArrowUpRight className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 mt-2 tabular-nums">
            {formatCurrency(metrics?.month_summary?.income, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Received in {metrics?.month_label}</p>
        </Card>

        {/* Month Expense */}
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Month Outflow</span>
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 tabular-nums">
            {formatCurrency(metrics?.month_summary?.expense, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Expenses recorded this month</p>
        </Card>

        {/* Net Savings Rate */}
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Savings Rate</span>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-violet-300 mt-2 tabular-nums">
            {metrics?.month_summary?.savings_rate || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Net savings: {formatCurrency(metrics?.month_summary?.net_savings, currencySymbol)}
          </p>
        </Card>
      </div>

      {/* Charts & Spending Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cashflow 6-Month Trend Chart */}
        <Card className="lg:col-span-8 p-6 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
            <div>
              <CardTitle>Cashflow History</CardTitle>
              <CardDescription>Income vs Expenses over the past 6 months</CardDescription>
            </div>
            <Link href="/insights">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>Detailed Trends</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="h-72 w-full mt-4">
            {metrics?.cashflow_trend && metrics.cashflow_trend.some((d) => d.income > 0 || d.expense > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.cashflow_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2c" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121218',
                      borderColor: '#22222e',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No Cashflow History Yet"
                description="Record income and expenses to visualize your 6-month financial trajectory."
                actionLabel="Add Transaction"
                onAction={openAddTransaction}
              />
            )}
          </div>
        </Card>

        {/* Right: Spending by Category */}
        <Card className="lg:col-span-4 p-6 bg-[#121218] border-[#22222e] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
              <div>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Budget vs actual for {metrics?.month_label}</CardDescription>
              </div>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="text-xs">
                  <span>Budgets</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4 mt-4 max-h-72 overflow-y-auto pr-1">
              {metrics?.spending_by_category && metrics.spending_by_category.length > 0 ? (
                metrics.spending_by_category.map((cat) => (
                  <div key={cat.category_id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-200 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </span>
                      <span className="font-semibold text-slate-200 tabular-nums">
                        {formatCurrency(cat.spent, currencySymbol)}
                        {cat.budget > 0 && (
                          <span className="text-slate-500 font-normal ml-1">
                            / {formatCurrency(cat.budget, currencySymbol)}
                          </span>
                        )}
                      </span>
                    </div>
                    {cat.budget > 0 && (
                      <div className="w-full bg-[#1c1c28] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cat.percentage > 100
                              ? 'bg-rose-500'
                              : cat.percentage > 80
                              ? 'bg-amber-500'
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No Expenses Logged"
                  description="Add your first expense to see your category breakdown."
                  actionLabel="Add Expense"
                  onAction={openAddTransaction}
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Upcoming Recurring & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Bills */}
        <Card className="lg:col-span-6 p-6 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
            <div>
              <CardTitle>Upcoming Bills & Subscriptions</CardTitle>
              <CardDescription>Committed recurring obligations for this month</CardDescription>
            </div>
            <Link href="/recurring">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {metrics?.upcoming_recurring && metrics.upcoming_recurring.length > 0 ? (
              metrics.upcoming_recurring.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0b0b10] border border-[#22222e] hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 font-bold text-xs border border-purple-500/20">
                      {bill.due_day}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{bill.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {bill.is_paid ? 'Paid for this month' : `Due on ${formatDate(bill.due_date)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-100 tabular-nums">
                      {formatCurrency(bill.amount, currencySymbol)}
                    </span>
                    {bill.is_paid ? (
                      <Badge variant="purple">Paid</Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLogRecurringPayment(bill.id)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Log Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No Recurring Bills Set"
                description="Add Netflix, rent, or utilities to reserve cash automatically in Safe to Spend."
                actionLabel="Add Recurring Bill"
                onAction={() => (window.location.href = '/recurring')}
              />
            )}
          </div>
        </Card>

        {/* Savings Goals Preview */}
        <Card className="lg:col-span-6 p-6 bg-[#121218] border-[#22222e]">
          <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
            <div>
              <CardTitle>Active Savings Goals</CardTitle>
              <CardDescription>Target milestones and progress</CardDescription>
            </div>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>All Goals</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {metrics?.goals_preview && metrics.goals_preview.length > 0 ? (
              metrics.goals_preview.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl bg-[#0b0b10] border border-[#22222e] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{goal.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 tabular-nums">
                        {formatCurrency(goal.current_amount, currencySymbol)} /{' '}
                        {formatCurrency(goal.target_amount, currencySymbol)}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedGoalForContribution(goal)}
                        className="text-[10px] h-6 px-2"
                      >
                        + Add Funds
                      </Button>
                    </div>
                  </div>

                  <div className="w-full bg-[#1c1c28] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: goal.color || '#8b5cf6',
                        width: `${Math.min(goal.progress_percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No Savings Goals Established"
                description="Set milestones for vacations, emergency buffers, or investments."
                actionLabel="Create Goal"
                onAction={() => (window.location.href = '/goals')}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card className="p-6 bg-[#121218] border-[#22222e]">
        <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest entries logged in your account</CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs">
              <span>View Full Ledger</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {metrics?.recent_transactions && metrics.recent_transactions.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#22222e] text-slate-400">
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222e]/60">
                {metrics.recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181824]/50 transition-colors">
                    <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                    <td className="py-3">
                      <Badge variant="neutral" className="text-[10px]">
                        {tx.category_name}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-400">{formatDate(tx.date)}</td>
                    <td
                      className={`py-3 text-right font-bold tabular-nums ${
                        tx.type === 'income' ? 'text-purple-300' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="No Recent Transactions"
              description="Your spending ledger is empty. Click below to record your first transaction."
              actionLabel="Add Transaction"
              onAction={openAddTransaction}
            />
          )}
        </div>
      </Card>

      {/* Quick Goal Contribution Modal */}
      <ContributeGoalModal
        isOpen={!!selectedGoalForContribution}
        onClose={() => setSelectedGoalForContribution(null)}
        onSuccess={() => {
          fetchDashboardData();
          triggerRefresh();
        }}
        goal={selectedGoalForContribution}
      />
    </div>
  );
}
