'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Category, Transaction } from '@/lib/types';
import { toast } from 'sonner';
import { useMonth } from '@/lib/month-context';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: Transaction | null;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  editTransaction,
}: AddTransactionModalProps) {
  const { currencySymbol } = useMonth();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(String(editTransaction.amount));
        setDescription(editTransaction.description);
        setCategoryId(editTransaction.category ? String(editTransaction.category) : '');
        setDate(editTransaction.date);
        setNotes(editTransaction.notes || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editTransaction]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch {
      // Handled silently
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        category: categoryId ? parseInt(categoryId, 10) : null,
        date,
        notes: notes.trim(),
      };

      if (editTransaction) {
        await api.transactions.update(editTransaction.id, payload);
        toast.success('Transaction updated!');
      } else {
        await api.transactions.create(payload);
        toast.success(`${type === 'income' ? 'Income' : 'Expense'} recorded successfully!`);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'Record Transaction'}
      description="Add real cashflow entries to update your Safe to Spend metrics."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <Input
            label={`Amount (${currencySymbol})`}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            className="text-lg font-semibold tracking-tight"
          />
        </div>

        {/* Description */}
        <div>
          <Input
            label="Description"
            placeholder="e.g., Grocery run, Client invoice, Dinner"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">General / Uncategorized</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            placeholder="Add any extra context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="emerald" size="sm" isLoading={isLoading}>
            {editTransaction ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
