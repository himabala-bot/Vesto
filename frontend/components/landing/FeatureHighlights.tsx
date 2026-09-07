'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  PieChart,
  Target,
  RefreshCw,
  TrendingUp,
  Zap,
  Check,
  ChevronDown,
} from 'lucide-react';

export function FeatureHighlights() {
  const features = [
    {
      icon: ShieldAlert,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      title: 'Safe to Spend Engine',
      description:
        'Know down to the dollar what you can safely spend today without touching committed bills or your emergency fund.',
    },
    {
      icon: RefreshCw,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      title: 'Recurring Bill Radar',
      description:
        'Tracks upcoming subscriptions and fixed bills automatically, with quick one-click payment logging.',
    },
    {
      icon: Target,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      title: 'Milestone Savings Goals',
      description:
        'Set targets for vacations, down payments, or emergency reserves. Watch progress bars climb with instant deposits.',
    },
    {
      icon: PieChart,
      color: 'text-purple-300',
      bg: 'bg-purple-500/10',
      title: 'Category Budgets',
      description:
        'Set custom monthly thresholds for groceries, dining, and shopping. Get proactive warnings before exceeding limits.',
    },
    {
      icon: TrendingUp,
      color: 'text-violet-300',
      bg: 'bg-violet-500/10',
      title: 'Historical Trends & Velocity',
      description:
        'Compare your day-by-day spending velocity against last month to catch spending spikes early in the cycle.',
    },
    {
      icon: Zap,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      title: 'Total Balance & Net Cashflow',
      description:
        'Shows real lifetime cumulative balance and net savings rate across all past and active months.',
    },
  ];

  return (
    <div id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">

      <div>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="purple" className="mb-2">
            Engineered for Simplicity
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No complex accounting spreadsheets. Just crystal-clear financial control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-6 bg-[#121218] border-[#22222e] hover:border-purple-500/40 transition-all">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} ${f.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </div>


      <div id="how-it-works" className="rounded-3xl border border-[#22222e] bg-[#121218]/50 p-8 sm:p-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Badge variant="purple" className="mb-2">
            3 Simple Steps
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Vesto Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold mx-auto sm:mx-0">
              1
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Add Income & Fixed Bills</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log your salary and recurring commitments (Rent, Utilities, Subscriptions).
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold mx-auto sm:mx-0">
              2
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Set Savings Target</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define your monthly savings goals. Vesto locks this amount away from your daily pool.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold mx-auto sm:mx-0">
              3
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Check Your Daily Safe Limit</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open Vesto anytime to see exactly what you can spend today with zero financial stress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-[#22222e] bg-[#08080c] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xs">
            V
          </div>
          <span className="font-bold text-slate-300">VESTO</span>
          <span>© {new Date().getFullYear()} Vesto Financial. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#calculator" className="hover:text-purple-400 transition-colors">
            Calculator
          </a>
          <a href="#features" className="hover:text-purple-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-purple-400 transition-colors">
            How It Works
          </a>
        </div>
      </div>
    </footer>
  );
}
