'use client';

import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { InteractiveSafeCalculator } from '@/components/landing/InteractiveSafeCalculator';
import { FeatureHighlights, LandingFooter } from '@/components/landing/FeatureHighlights';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080c] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <LandingNav />
      <main>
        <Hero />
        <InteractiveSafeCalculator />
        <FeatureHighlights />
      </main>
      <LandingFooter />
    </div>
  );
}
