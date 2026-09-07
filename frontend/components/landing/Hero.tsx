'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Shield, Sparkles, TrendingUp, CheckCircle, Lock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-purple-600/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">




        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Spend with clarity. <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Never guess what’s safe to spend again.
          </span>
        </h1>


        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Vesto calculates your exact daily and monthly safe spending limits in real time by reserving cash for rent, subscriptions, and savings goals first.
        </p>


        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="purple" size="lg" className="w-full sm:w-auto text-sm px-8">
              <span>Start Free with Vesto</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#calculator" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
              <span>Try Safe to Spend Calculator</span>
            </Button>
          </a>
        </div>


        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-purple-400" />
            <span>Real database tracking (Zero fake data)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span>All-time balance & cumulative net worth</span>
          </div>
        </div>
      </div>
    </section>
  );
}
