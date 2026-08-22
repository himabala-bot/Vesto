'use client';

import React, { useState, createContext, useContext } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';

interface GlobalModalContextType {
  openAddTransaction: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const GlobalModalContext = createContext<GlobalModalContextType>({
  openAddTransaction: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const useGlobalModal = () => useContext(GlobalModalContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthGuard>
      <GlobalModalContext.Provider
        value={{
          openAddTransaction: () => setIsAddTxOpen(true),
          refreshTrigger,
          triggerRefresh,
        }}
      >
        <div className="flex min-h-screen bg-[#08080c] text-slate-100">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
            <AppHeader onOpenAddTransaction={() => setIsAddTxOpen(true)} />
            <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-16">
              {children}
            </main>
          </div>
        </div>

        <AddTransactionModal
          isOpen={isAddTxOpen}
          onClose={() => setIsAddTxOpen(false)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />
      </GlobalModalContext.Provider>
    </AuthGuard>
  );
}
