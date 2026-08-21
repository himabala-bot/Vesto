'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '@/lib/month-context';
import { getMonthOptions } from '@/lib/utils';

export function MonthPicker() {
  const { selectedMonth, setSelectedMonth } = useMonth();
  const options = getMonthOptions();

  const handlePrev = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(prevStr);
  };

  const handleNext = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextStr);
  };

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1 shadow-sm">
      <button
        onClick={handlePrev}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        title="Previous Month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 px-2">
        <Calendar className="h-3.5 w-3.5 text-emerald-400" />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleNext}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        title="Next Month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
