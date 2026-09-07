'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { InsightsData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

export default function InsightsPage() {
  const { selectedMonth, currencySymbol } = useMonth();
  const { refreshTrigger, openAddTransaction } = useGlobalModal();

  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.analytics.getInsights(selectedMonth);
      setInsights(data);
    } catch {
      toast.error('Failed to load insights data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights, refreshTrigger]);

  if (isLoading && !insights) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Generating spending intelligence & trends...</p>
        </div>
      </div>
    );
  }

  const curr = insights?.current_summary;
  const momChange = curr?.mom_change_percentage || 0;
  const isSpendingUp = momChange > 0;

  const pieData = (Array.isArray(insights?.category_insights) ? insights.category_insights : []).map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span>Financial Insights & Trends</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Spending velocity, category distribution and automated observations for <span className="text-purple-300 font-medium">{insights?.month_label}</span>
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Current Month Outflow</span>
          <div className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {formatCurrency(curr?.expense, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            {momChange !== 0 ? (
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  isSpendingUp ? 'text-rose-400' : 'text-purple-300'
                }`}
              >
                {isSpendingUp ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {isSpendingUp ? `+${momChange}%` : `${momChange}%`}
              </span>
            ) : (
              <span className="text-slate-500">0.0%</span>
            )}
            <span className="text-slate-500">vs previous month</span>
          </div>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Previous Month Outflow</span>
          <div className="text-2xl font-bold text-slate-300 mt-2 tabular-nums">
            {formatCurrency(insights?.previous_summary?.expense, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full prior cycle total</p>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Net Month Savings</span>
          <div
            className={`text-2xl font-bold mt-2 tabular-nums ${
              (curr?.net_savings || 0) >= 0 ? 'text-purple-300' : 'text-rose-400'
            }`}
          >
            {formatCurrency(curr?.net_savings, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Income minus total outflow</p>
        </Card>
      </div>


      {insights?.smart_alerts && insights.smart_alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Intelligent Observations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.smart_alerts.map((alert, idx) => (
              <Card
                key={idx}
                className={`p-4 border transition-all ${
                  alert.type === 'success'
                    ? 'border-purple-500/30 bg-purple-950/10'
                    : alert.type === 'warning'
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : alert.type === 'danger'
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : 'border-[#22222e] bg-[#121218]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      alert.type === 'success'
                        ? 'text-purple-400 bg-purple-500/20'
                        : alert.type === 'warning'
                        ? 'text-amber-400 bg-amber-500/20'
                        : alert.type === 'danger'
                        ? 'text-rose-400 bg-rose-500/20'
                        : 'text-slate-400 bg-[#181824]'
                    }`}
                  >
                    {alert.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'danger' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'info' && <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-slate-100">{alert.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                    {alert.action_label && (
                      <Button
                        variant="purple"
                        size="sm"
                        onClick={openAddTransaction}
                        className="mt-3 text-[11px] h-7 px-3"
                      >
                        {alert.action_label}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}


      <Card className="p-6 bg-[#121218] border-[#22222e]">
        <div className="flex items-center justify-between pb-4 border-b border-[#22222e]">
          <div>
            <CardTitle>Spending Velocity Pace</CardTitle>
            <CardDescription>
              Cumulative day-by-day spend of {insights?.month_label} compared to previous month
            </CardDescription>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          {insights?.velocity_data &&
          insights.velocity_data.some((d) => d.current_month !== null || d.previous_month !== null) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.velocity_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2c" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(d) => `Day ${d}`} />
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
                  labelFormatter={(lbl) => `Day ${lbl} of Month`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="current_month"
                  name={`Current Month (${insights?.month_label})`}
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="previous_month"
                  name="Previous Month"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="Not Enough Historical Data"
              description="Spending velocity requires at least one transaction to trace your cumulative cash curve."
              actionLabel="Add Transaction"
              onAction={openAddTransaction}
            />
          )}
        </div>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <Card className="lg:col-span-5 p-6 bg-[#121218] border-[#22222e] flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#22222e]">
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Share of wallet by category</CardDescription>
            </div>

            <div className="h-64 w-full mt-4 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No Category Data"
                  description="Log an expense to see your spending distribution."
                  actionLabel="Add Expense"
                  onAction={openAddTransaction}
                />
              )}
            </div>
          </div>
        </Card>


        <Card className="lg:col-span-7 p-0 bg-[#121218] border-[#22222e] overflow-hidden">
          <div className="p-5 border-b border-[#22222e]">
            <CardTitle>Month-over-Month Category Changes</CardTitle>
            <CardDescription>Shift in outflow compared to previous month</CardDescription>
          </div>

          <div className="overflow-x-auto">
            {insights?.category_insights && insights.category_insights.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#22222e] bg-[#0d0d13] text-slate-400">
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold text-right">This Month</th>
                    <th className="px-5 py-3 font-semibold text-right">Share</th>
                    <th className="px-5 py-3 font-semibold text-right">MoM Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22222e]/60">
                  {insights.category_insights.map((cat) => (
                    <tr key={cat.category_id} className="hover:bg-[#181824]/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-200 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-100 tabular-nums">
                        {formatCurrency(cat.amount, currencySymbol)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400 tabular-nums">
                        {cat.percentage}%
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {cat.mom_change_percentage !== null ? (
                          <span
                            className={`font-semibold ${
                              cat.mom_change_percentage > 0 ? 'text-rose-400' : 'text-purple-300'
                            }`}
                          >
                            {cat.mom_change_percentage > 0
                              ? `+${cat.mom_change_percentage}%`
                              : `${cat.mom_change_percentage}%`}
                          </span>
                        ) : (
                          <span className="text-slate-500">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No Category Expenses"
                  description="Add categorized expenses to inspect your monthly changes."
                  actionLabel="Add Transaction"
                  onAction={openAddTransaction}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
