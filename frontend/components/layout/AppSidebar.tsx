'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  RefreshCw,
  Sparkles,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/goals', label: 'Savings Goals', icon: Target },
  { href: '/recurring', label: 'Recurring Bills', icon: RefreshCw },
  { href: '/insights', label: 'Insights & Trends', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/90 min-h-screen px-4 py-6 justify-between shrink-0">
      <div>
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 text-lg">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">VESTO</span>
            <span className="text-[10px] uppercase font-medium text-emerald-400 tracking-wider">
              Safe to Spend
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-400 font-semibold text-xs border border-slate-700">
            {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </span>
            <span className="text-[10px] text-slate-500 truncate">{user?.email || 'Logged in'}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
