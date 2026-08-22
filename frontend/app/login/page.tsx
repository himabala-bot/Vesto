'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      await login({ username, password });
    } catch {
      // toast shown in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('alex');
    setPassword('vesto2026!');
    setIsLoading(true);
    try {
      await login({ username: 'alex', password: 'vesto2026!' });
    } catch {
      // If demo user doesn't exist yet, try login or register
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08080c]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 text-white font-black text-xl shadow-lg shadow-purple-600/30">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-white">VESTO</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your personalized Safe to Spend dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-[#121218] border-[#22222e] p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Username or Email"
                type="text"
                placeholder="e.g. alex"
                icon={<UserIcon className="h-4 w-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="purple" className="w-full mt-2" isLoading={isLoading}>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#22222e] text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-purple-400 hover:underline font-semibold">
                Sign up free
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
