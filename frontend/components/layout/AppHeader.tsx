'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Menu, X, LayoutDashboard, ArrowLeftRight, PieChart, Target, RefreshCw, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MonthPicker } from './MonthPicker';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface AppHeaderProps {
  onOpenAddTransaction: () => void;
}

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/insights', label: 'Insights', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppHeader({ onOpenAddTransaction }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes('/transactions')) return 'Transactions';
    if (pathname.includes('/budgets')) return 'Monthly Budgets';
    if (pathname.includes('/goals')) return 'Savings Goals';
    if (pathname.includes('/recurring')) return 'Recurring Expenses';
    if (pathname.includes('/insights')) return 'Financial Insights';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Financial Overview';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#22222e] bg-[#08080c]/80 px-4 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#181824] hover:text-slate-200 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-100">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-3">
          <MonthPicker />

          <Button
            variant="purple"
            size="sm"
            onClick={onOpenAddTransaction}
            className="hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>

          <Button
            variant="purple"
            size="icon"
            onClick={onOpenAddTransaction}
            className="sm:hidden h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#08080c]/95 lg:hidden pt-16 px-6 pb-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-2 mt-4">
            {MOBILE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-[#181824]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
