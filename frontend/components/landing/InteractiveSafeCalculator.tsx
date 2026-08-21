'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Calendar, TrendingUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function InteractiveSafeCalculator() {
  // State for interactive calculator without login
  const [income, setIncome] = useState<number>(5500);
  const [fixedBills, setFixedBills] = useState<number>(1800);
  const [savingsTarget, setSavingsTarget] = useState<number>(1000);
  const [spentSoFar, setSpentSoFar] = useState<number>(1200);
  const [daysRemaining, setDaysRemaining] = useState<number>(14);

  // Calculations
  const discretionaryPool = Math.max(0, income - fixedBills - savingsTarget);
  const remainingDiscretionary = Math.max(0, discretionaryPool - spentSoFar);
  const dailySafeSpend = daysRemaining > 0 ? (remainingDiscretionary / daysRemaining) : 0;
  const weeklySafeSpend = Math.min(remainingDiscretionary, dailySafeSpend * 7);

  // Pacing status
  let status: 'safe' | 'caution' | 'danger' = 'safe';
  if (spentSoFar > discretionaryPool) {
    status = 'danger';
  } else if (discretionaryPool > 0 && remainingDiscretionary / discretionaryPool < 0.25) {
    status = 'caution';
  }

  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Badge variant="success" className="mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Calculator • No Sign-Up Needed</span>
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          How much can I safely spend right now?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          Traditional budgeting tells you what you spent last month. <strong>Vesto tells you what you can spend today without touching your rent or savings.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Card */}
        <Card className="lg:col-span-7 bg-slate-900/90 border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Simulate Your Monthly Cashflow</span>
            </h3>
            <span className="text-xs text-slate-400">Adjust sliders or numbers</span>
          </div>

          {/* Monthly Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <label className="text-slate-300">Expected Monthly Income</label>
              <span className="text-emerald-400 font-semibold text-sm">{formatMoney(income)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="100"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$1,000</span>
              <span>$10,000</span>
              <span>$20,000+</span>
            </div>
          </div>

          {/* Fixed Committed Bills (Rent, Utilities, Subscriptions) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <label className="text-slate-300">Committed Bills & Recurring (Rent, Utilities, Subscriptions)</label>
              <span className="text-slate-200 font-semibold text-sm">{formatMoney(fixedBills)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={income}
              step="50"
              value={fixedBills}
              onChange={(e) => setFixedBills(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Savings Goals Target */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <label className="text-slate-300">Monthly Savings Goal (Emergency Fund, Investments)</label>
              <span className="text-indigo-400 font-semibold text-sm">{formatMoney(savingsTarget)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, income - fixedBills)}
              step="50"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Spent So Far */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <label className="text-slate-300">Discretionary Spent So Far This Month</label>
              <span className="text-amber-400 font-semibold text-sm">{formatMoney(spentSoFar)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(1000, discretionaryPool * 1.5)}
              step="50"
              value={spentSoFar}
              onChange={(e) => setSpentSoFar(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Days Remaining */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <label className="text-slate-300">Days Remaining In Month</label>
              <span className="text-slate-300 font-semibold text-sm">{daysRemaining} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="31"
              step="1"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </Card>

        {/* Right Output Results Card */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            className={`p-6 sm:p-8 bg-slate-900/90 border transition-all ${
              status === 'safe'
                ? 'border-emerald-500/40 safe-glow-emerald'
                : status === 'caution'
                ? 'border-amber-500/40 safe-glow-amber'
                : 'border-rose-500/40 safe-glow-rose'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Safe to Spend Result
              </span>
              <Badge
                variant={status === 'safe' ? 'success' : status === 'caution' ? 'warning' : 'danger'}
              >
                {status === 'safe' && <CheckCircle2 className="h-3 w-3" />}
                {status === 'caution' && <AlertTriangle className="h-3 w-3" />}
                {status === 'danger' && <AlertTriangle className="h-3 w-3" />}
                <span>
                  {status === 'safe' ? 'On Track' : status === 'caution' ? 'Caution Buffer' : 'Limit Exceeded'}
                </span>
              </Badge>
            </div>

            {/* Big Daily Number */}
            <div className="my-4">
              <span className="text-xs font-medium text-slate-400">Your Safe Daily Allowance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatMoney(Math.round(dailySafeSpend))}
                </span>
                <span className="text-sm font-medium text-slate-400">/ day</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                For the remaining {daysRemaining} days of this month.
              </p>
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">This Week</span>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {formatMoney(Math.round(weeklySafeSpend))}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Month Remaining</span>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {formatMoney(Math.round(remainingDiscretionary))}
                </div>
              </div>
            </div>

            {/* Formula Breakdown Details */}
            <div className="mt-5 space-y-2 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Behind the Math:
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Income Pool</span>
                <span className="text-slate-200">+{formatMoney(income)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Committed Bills</span>
                <span className="text-rose-400">-{formatMoney(fixedBills)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Savings Goal Lock</span>
                <span className="text-indigo-400">-{formatMoney(savingsTarget)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spent So Far</span>
                <span className="text-amber-400">-{formatMoney(spentSoFar)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-slate-800 text-slate-200">
                <span>Remaining Pool</span>
                <span className="text-emerald-400">{formatMoney(remainingDiscretionary)}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <Link href="/register" className="w-full">
                <Button variant="emerald" className="w-full">
                  <span>Track This Automatically with Vesto</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
