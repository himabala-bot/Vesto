'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { useMonth } from '@/lib/month-context';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  DollarSign,
  Lock,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar', symbol: '$' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar', symbol: '$' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar', symbol: '$' },
];

export default function SettingsPage() {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const { setCurrencySymbol } = useMonth();


  const [currency, setCurrency] = useState('USD');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState('0.00');
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState('0.00');
  const [isSavingProfile, setIsSavingProfile] = useState(false);


  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [isAddingCategory, setIsAddingCategory] = useState(false);


  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setCurrency(user.profile.currency || 'USD');
      setMonthlyIncomeTarget(String(user.profile.monthly_income_target || '0.00'));
      setMonthlySavingsTarget(String(user.profile.monthly_savings_target || '0.00'));
    }
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const selectedCurrencyObj = CURRENCY_OPTIONS.find((c) => c.value === currency);
      const symbol = selectedCurrencyObj ? selectedCurrencyObj.symbol : '$';

      await updateUserProfile({
        currency,
        currency_symbol: symbol,
        monthly_income_target: parseFloat(monthlyIncomeTarget) || 0,
        monthly_savings_target: parseFloat(monthlySavingsTarget) || 0,
      });

      setCurrencySymbol(symbol);
      toast.success('Financial preferences updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Please enter category name.');
      return;
    }

    setIsAddingCategory(true);
    try {
      await api.categories.create({
        name: newCatName.trim(),
        type: newCatType,
        color: newCatColor,
        icon: 'tag',
      });
      toast.success(`Category "${newCatName}" created!`);
      setNewCatName('');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.categories.delete(id);
      toast.success('Category removed.');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Cannot delete default system category.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please fill in both fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.auth.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">

      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-emerald-400" />
          <span>Account & Preferences</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage currency, financial targets, categories, and security
        </p>
      </div>


      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
        <div className="pb-4 border-b border-slate-800/80">
          <CardTitle>Financial Profile & Baseline</CardTitle>
          <CardDescription>
            Configure your currency and baseline monthly targets for Safe to Spend calculations.
          </CardDescription>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Primary Display Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <div>
              <Input
                label="Monthly Baseline Income Target"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Monthly Target Savings Allocation"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={monthlySavingsTarget}
                onChange={(e) => setMonthlySavingsTarget(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="emerald" size="sm" isLoading={isSavingProfile}>
              Save Financial Preferences
            </Button>
          </div>
        </form>
      </Card>


      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
        <div className="pb-4 border-b border-slate-800/80">
          <CardTitle>Category Manager</CardTitle>
          <CardDescription>
            Create custom spending or income categories tailored to your life.
          </CardDescription>
        </div>


        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <Input
              label="New Category Name"
              placeholder="e.g., Pet Care, Coffee, Side Hustle"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              label="Type"
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as any)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="h-10 w-full rounded-xl bg-slate-950 border border-slate-800 p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full h-10"
              isLoading={isAddingCategory}
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </form>


        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Active Categories ({categories.length})
          </span>
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-200 font-medium">{cat.name}</span>
                <span className="text-[10px] text-slate-500 capitalize">({cat.type})</span>
                {!cat.is_default && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-slate-500 hover:text-rose-400 ml-1 transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>


      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
        <div className="pb-4 border-b border-slate-800/80">
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Update your login credentials.</CardDescription>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="New Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="outline" size="sm" isLoading={isChangingPassword}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
