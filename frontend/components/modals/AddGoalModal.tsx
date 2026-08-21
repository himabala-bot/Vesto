'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { SavingsGoal } from '@/lib/types';
import { toast } from 'sonner';
import { useMonth } from '@/lib/month-context';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editGoal?: SavingsGoal | null;
}

const COLOR_OPTIONS = [
  { label: 'Emerald Green', value: '#10b981' },
  { label: 'Indigo Blue', value: '#6366f1' },
  { label: 'Cyan Sky', value: '#06b6d4' },
  { label: 'Amber Gold', value: '#f59e0b' },
  { label: 'Rose Pink', value: '#f43f5e' },
  { label: 'Purple Violet', value: '#a855f7' },
];

const ICON_OPTIONS = [
  { label: 'Target / Focus', value: 'target' },
  { label: 'Shield / Emergency', value: 'shield' },
  { label: 'Home / Real Estate', value: 'home' },
  { label: 'Plane / Travel', value: 'plane' },
  { label: 'Car / Vehicle', value: 'car' },
  { label: 'Laptop / Tech', value: 'laptop' },
  { label: 'Gift / Celebration', value: 'gift' },
  { label: 'Trending / Investment', value: 'trending-up' },
];

export function AddGoalModal({
  isOpen,
  onClose,
  onSuccess,
  editGoal,
}: AddGoalModalProps) {
  const { currencySymbol } = useMonth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('target');
  const [color, setColor] = useState('#10b981');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editGoal) {
        setName(editGoal.name);
        setTargetAmount(String(editGoal.target_amount));
        setCurrentAmount(String(editGoal.current_amount));
        setTargetDate(editGoal.target_date || '');
        setIcon(editGoal.icon || 'target');
        setColor(editGoal.color || '#10b981');
      } else {
        setName('');
        setTargetAmount('');
        setCurrentAmount('0.00');
        setTargetDate('');
        setIcon('target');
        setColor('#10b981');
      }
    }
  }, [isOpen, editGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a goal name.');
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      toast.error('Please enter a target amount.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: currentAmount ? parseFloat(currentAmount) : 0,
        target_date: targetDate || null,
        icon,
        color,
      };

      if (editGoal) {
        await api.goals.update(editGoal.id, payload);
        toast.success('Goal updated!');
      } else {
        await api.goals.create(payload);
        toast.success('Savings goal established!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      description="Track progress towards key milestones like emergency funds, travel, or big purchases."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Goal Name"
            placeholder="e.g. Emergency Fund, Summer Vacation, New Laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              label={`Target Amount (${currencySymbol})`}
              type="number"
              step="0.01"
              placeholder="5000.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label={`Current Starting Balance (${currencySymbol})`}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Target Date (Optional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Select
              label="Theme Icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              options={ICON_OPTIONS}
            />
          </div>
          <div>
            <Select
              label="Color Accent"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              options={COLOR_OPTIONS}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="emerald" size="sm" isLoading={isLoading}>
            {editGoal ? 'Save Changes' : 'Establish Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
