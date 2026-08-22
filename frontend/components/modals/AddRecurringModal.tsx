'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Category, RecurringExpense } from '@/lib/types';
import { toast } from 'sonner';
import { useMonth } from '@/lib/month-context';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecurring?: RecurringExpense | null;
}

export function AddRecurringModal({
  isOpen,
  onClose,
  onSuccess,
  editRecurring,
}: AddRecurringModalProps) {
  const { currencySymbol } = useMonth();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [dueDay, setDueDay] = useState('1');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExpenseCategories();
      if (editRecurring) {
        setName(editRecurring.name);
        setAmount(String(editRecurring.amount));
        setCategoryId(editRecurring.category ? String(editRecurring.category) : '');
        setFrequency(editRecurring.frequency);
        setDueDay(String(editRecurring.due_day));
      } else {
        setName('');
        setAmount('');
        setCategoryId('');
        setFrequency('monthly');
        setDueDay('1');
      }
    }
  }, [isOpen, editRecurring]);

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
    if (!name.trim()) {
      toast.error('Please enter bill/subscription name.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        amount: parseFloat(amount),
        category: categoryId ? parseInt(categoryId, 10) : null,
        frequency,
        due_day: parseInt(dueDay, 10),
      };

      if (editRecurring) {
        await api.recurring.update(editRecurring.id, payload);
        toast.success('Recurring expense updated!');
      } else {
        await api.recurring.create(payload);
        toast.success('Recurring expense committed!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save recurring expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRecurring ? 'Edit Recurring Bill' : 'Track Recurring Bill'}
      description="Committed bills (like Rent, Netflix, Gym) are factored into your Safe to Spend calculation automatically."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Service / Bill Name"
            placeholder="e.g., Rent, Netflix, Spotify, Gym, Electric"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              label={`Amount (${currencySymbol})`}
              type="number"
              step="0.01"
              placeholder="15.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">General Bill</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Due Day (1-31)"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#22222e]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="purple" size="sm" isLoading={isLoading}>
            {editRecurring ? 'Save Changes' : 'Add Recurring Bill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
