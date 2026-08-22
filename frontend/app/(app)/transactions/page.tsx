'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { useMonth } from '@/lib/month-context';
import { useGlobalModal } from '../layout';
import { api } from '@/lib/api';
import { Transaction, Category } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  Download,
  Filter,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { selectedMonth, currencySymbol } = useMonth();
  const { refreshTrigger, triggerRefresh } = useGlobalModal();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        month: selectedMonth,
      };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await api.transactions.getAll(params);
      setTransactions(res.results || res);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, search, typeFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.transactions.delete(id);
      toast.success('Transaction removed.');
      fetchTransactions();
      triggerRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  // Calculations for filtered list
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netCashflow = totalIncome - totalExpense;

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.info('No transactions to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.category_details?.name || 'General').replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vesto_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Transactions</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full record of all income and expenses for {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="purple"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Filter and Summary Bar */}
      <Card className="p-4 sm:p-5 bg-[#121218] border-[#22222e] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6">
            <Input
              placeholder="Search description, category, or notes..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Ledger Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#22222e] text-center sm:text-left">
          <div className="p-2 sm:p-3 rounded-xl bg-[#0b0b10] border border-[#22222e]">
            <span className="text-[11px] font-medium text-slate-400">Total Filtered Inflow</span>
            <div className="text-sm sm:text-base font-bold text-purple-300 mt-0.5 tabular-nums">
              +{formatCurrency(totalIncome, currencySymbol)}
            </div>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-[#0b0b10] border border-[#22222e]">
            <span className="text-[11px] font-medium text-slate-400">Total Filtered Outflow</span>
            <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 tabular-nums">
              -{formatCurrency(totalExpense, currencySymbol)}
            </div>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-[#0b0b10] border border-[#22222e]">
            <span className="text-[11px] font-medium text-slate-400">Net Month Cashflow</span>
            <div
              className={`text-sm sm:text-base font-bold mt-0.5 tabular-nums ${
                netCashflow >= 0 ? 'text-slate-100' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netCashflow, currencySymbol)}
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 bg-[#121218] border-[#22222e] overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#22222e] bg-[#0d0d13] text-slate-400">
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222e]/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181824]/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{tx.description}</div>
                      {tx.notes && <div className="text-[11px] text-slate-500 mt-0.5">{tx.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{
                            backgroundColor: tx.category_details?.color || '#8b5cf6',
                          }}
                        />
                        <span className="text-slate-300 font-medium">
                          {tx.category_details?.name || 'General'}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold text-sm tabular-nums whitespace-nowrap ${
                        tx.type === 'income' ? 'text-purple-300' : 'text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currencySymbol)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#181824] rounded-lg transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No Transactions Found"
              description={
                search || typeFilter || categoryFilter
                  ? 'No entries match your active filters. Try clearing your search.'
                  : `No transactions recorded for ${selectedMonth}. Click below to add your first transaction.`
              }
              actionLabel="Add Transaction"
              onAction={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          fetchTransactions();
          triggerRefresh();
        }}
        editTransaction={editingTransaction}
      />
    </div>
  );
}
