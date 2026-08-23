'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08080c] px-4 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#121218] border border-[#22222e] shadow-2xl space-y-6">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181824] hover:bg-[#232332] border border-[#2a2a3c] text-slate-200 text-xs font-semibold transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
