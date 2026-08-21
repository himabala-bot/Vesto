'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Shield, Sparkles, TrendingUp, CheckCircle, Lock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="success" className="px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Modern Personal Finance • Built for Control</span>
          </Badge>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Spend with clarity. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Never guess what’s safe to spend again.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Vesto calculates your exact daily and monthly safe spending limits in real time by reserving cash for rent, subscriptions, and savings goals first.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="emerald" size="lg" className="w-full sm:w-auto text-sm px-8">
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

        {/* Key trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Real database tracking (Zero fake data)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>JWT Secure & Private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>All-time balance & cumulative net worth</span>
          </div>
        </div>
      </div>
    </section>
  );
}
