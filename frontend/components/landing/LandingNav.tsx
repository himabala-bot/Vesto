'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black shadow-md shadow-emerald-500/20 text-lg">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">VESTO</span>
            <span className="text-[9px] uppercase font-semibold text-emerald-400 tracking-wider">
              Safe to Spend
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">
            Safe to Spend Calculator
          </a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="emerald" size="sm" className="text-xs">
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
