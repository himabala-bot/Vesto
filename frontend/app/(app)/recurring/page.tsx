'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddRecurringModal } from '@/components/modals/AddRecurringModal';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { RecurringExpense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  IndianRupee,
  CreditCard,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RecurringPage() {
  const { selectedMonth, currencySymbol } = useMonth();
  const { refreshTrigger, triggerRefresh } = useGlobalModal();

  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);

  const fetchRecurring = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.recurring.getAll();
      setRecurringList(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load recurring bills');
      setRecurringList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring, refreshTrigger]);

  const handleLogPayment = async (id: number, name: string) => {
    try {
      const res = await api.recurring.logPayment(id);
      toast.success(res.message || `Payment recorded for ${name}!`);
      fetchRecurring();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to log payment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this recurring bill?')) return;
    try {
      await api.recurring.delete(id);
      toast.success('Recurring expense removed.');
      fetchRecurring();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete recurring expense');
    }
  };


  const monthlyTotal = recurringList.reduce((acc, r) => {
    const amt = Number(r.amount);
    if (r.frequency === 'monthly') return acc + amt;
    if (r.frequency === 'weekly') return acc + amt * 4.33;
    if (r.frequency === 'yearly') return acc + amt / 12;
    return acc + amt;
  }, 0);

  const annualTotal = monthlyTotal * 12;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Recurring Expenses & Subscriptions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Committed regular outflows reserved by the Safe to Spend algorithm
          </p>
        </div>

        <Button
          variant="purple"
          size="sm"
          onClick={() => {
            setEditingRecurring(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Recurring Bill</span>
        </Button>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Monthly Committed Total</span>
          <div className="text-2xl font-bold text-rose-400 mt-2 tabular-nums">
            {formatCurrency(monthlyTotal, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Reserved automatically every month</p>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Annualized Outflow</span>
          <div className="text-2xl font-bold text-slate-100 mt-2 tabular-nums">
            {formatCurrency(annualTotal, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">12-month fixed obligation sum</p>
        </Card>

        <Card className="p-5 bg-[#121218] border-[#22222e]">
          <span className="text-xs text-slate-400">Active Subscriptions</span>
          <div className="text-2xl font-bold text-violet-300 mt-2 tabular-nums">
            {recurringList.length} Services
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tracked recurring commitments</p>
        </Card>
      </div>


      <Card className="p-0 bg-[#121218] border-[#22222e] overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : recurringList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#22222e] bg-[#0d0d13] text-slate-400">
                  <th className="px-6 py-3.5 font-semibold">Service / Bill</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Frequency</th>
                  <th className="px-6 py-3.5 font-semibold">Due Day</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222e]/60">
                {recurringList.map((item) => {
                  const amt = Number(item.amount);
                  const isPaidThisMonth = item.last_logged_date && item.last_logged_date.startsWith(selectedMonth);

                  return (
                    <tr key={item.id} className="hover:bg-[#181824]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        {isPaidThisMonth && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 font-medium mt-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Paid this month
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{
                              backgroundColor: item.category_details?.color || '#8b5cf6',
                            }}
                          />
                          <span className="text-slate-300 font-medium">
                            {item.category_details?.name || 'General Bill'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 capitalize">{item.frequency}</td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        Day {item.due_day} of month
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-sm text-slate-100 tabular-nums">
                        {formatCurrency(amt, currencySymbol)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={isPaidThisMonth ? 'secondary' : 'purple'}
                            size="sm"
                            onClick={() => handleLogPayment(item.id, item.name)}
                            className="text-[11px] h-7 px-2.5"
                          >
                            {isPaidThisMonth ? 'Log Again' : 'Log as Paid'}
                          </Button>
                          <button
                            onClick={() => {
                              setEditingRecurring(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#181824] rounded-lg transition-colors"
                            title="Edit Bill"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Bill"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No Recurring Bills Tracked"
              description="Add regular subscriptions like Netflix, Rent, Spotify, or Gym to automate your fixed obligation deductions in Safe to Spend."
              actionLabel="Add Recurring Bill"
              onAction={() => {
                setEditingRecurring(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}
      </Card>


      <AddRecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecurring(null);
        }}
        onSuccess={() => {
          fetchRecurring();
          triggerRefresh();
        }}
        editRecurring={editingRecurring}
      />
    </div>
  );
}
