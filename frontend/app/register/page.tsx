'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Lock, User as UserIcon, Mail, ArrowRight, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const selectedCurrencyObj = CURRENCY_OPTIONS.find((c) => c.value === currency);
      const symbol = selectedCurrencyObj ? selectedCurrencyObj.symbol : '₹';

    setIsLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        password,
        currency,
        currency_symbol: currencySymbol,
      });
    } catch {
      // toast shown in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-white">VESTO</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Start tracking your real cashflow and Safe to Spend limits
          </p>
        </div>

        {/* Register Card */}
        <Card className="bg-slate-900/90 border-slate-800 p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Your Name"
                placeholder="Alex Morgan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <Input
                label="Username"
                type="text"
                placeholder="alexmorgan"
                icon={<UserIcon className="h-4 w-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Password (min 6 characters)"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Select
                label="Primary Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <Button type="submit" variant="emerald" className="w-full mt-2" isLoading={isLoading}>
              <span>Create Account & Start</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
