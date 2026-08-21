'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Category, Budget } from '@/lib/types';
import { toast } from 'sonner';
import { useMonth } from '@/lib/month-context';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBudget?: Budget | null;
}

export function SetBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  editBudget,
}: SetBudgetModalProps) {
  const { selectedMonth, currencySymbol } = useMonth();
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadExpenseCategories();
      if (editBudget) {
        setCategoryId(String(editBudget.category));
        setAmount(String(editBudget.amount));
      } else {
        setCategoryId('');
        setAmount('');
      }
    }
  }, [isOpen, editBudget]);

  const loadExpenseCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data.filter((c) => c.type === 'expense'));
    } catch {
      // Handled silently
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select an expense category.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid monthly budget limit.');
      return;
    }

    setIsLoading(true);
    try {
      if (editBudget) {
        await api.budgets.update(editBudget.id, {
          category: parseInt(categoryId, 10),
          amount: parseFloat(amount),
          month: selectedMonth,
        });
        toast.success('Budget updated!');
      } else {
        await api.budgets.create({
          category: parseInt(categoryId, 10),
          amount: parseFloat(amount),
          month: selectedMonth,
        });
        toast.success('Monthly budget set!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save budget limit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editBudget ? 'Adjust Budget Limit' : 'Set Monthly Budget'}
      description={`Allocate a maximum spending threshold for ${selectedMonth}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Expense Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!editBudget}
            required
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Input
            label={`Monthly Limit (${currencySymbol})`}
            type="number"
            step="0.01"
            placeholder="500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            className="text-lg font-semibold"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="emerald" size="sm" isLoading={isLoading}>
            {editBudget ? 'Update Budget' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
