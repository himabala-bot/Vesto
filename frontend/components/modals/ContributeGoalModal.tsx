'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { SavingsGoal } from '@/lib/types';
import { toast } from 'sonner';
import { useMonth } from '@/lib/month-context';
import confetti from 'canvas-confetti';

interface ContributeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingsGoal | null;
}

export function ContributeGoalModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
}: ContributeGoalModalProps) {
  const { currencySymbol } = useMonth();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [logTransaction, setLogTransaction] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid contribution amount.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.goals.contribute(goal.id, {
        amount: parseFloat(amount),
        notes: notes.trim(),
        log_transaction: logTransaction,
      });

      // Check if goal reached 100%
      const newAmount = Number(goal.current_amount) + parseFloat(amount);
      if (newAmount >= Number(goal.target_amount)) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`🎉 Congratulations! You achieved your goal for ${goal.name}!`);
      } else {
        toast.success(res.message || 'Contribution added successfully!');
      }

      setAmount('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to contribute to goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Funds to ${goal.name}`}
      description="Deposit money toward this savings milestone."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label={`Contribution Amount (${currencySymbol})`}
            type="number"
            step="0.01"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            className="text-lg font-semibold text-purple-300"
          />
        </div>

        <div>
          <Input
            label="Memo / Note (Optional)"
            placeholder="e.g., Monthly transfer, Birthday gift"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="logTx"
            checked={logTransaction}
            onChange={(e) => setLogTransaction(e.target.checked)}
            className="h-4 w-4 rounded border-[#22222e] bg-[#0d0d13] text-purple-500 focus:ring-purple-500"
          />
          <label htmlFor="logTx" className="text-xs text-slate-300 cursor-pointer select-none">
            Also record as an expense transaction in your monthly spending ledger
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#22222e]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="purple" size="sm" isLoading={isLoading}>
            Deposit Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
}
