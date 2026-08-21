'use client';

import React, { createContext, useContext, useState } from 'react';
import { getCurrentMonthString } from './utils';

interface MonthContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  currencySymbol: string;
  setCurrencySymbol: (symbol: string) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const MonthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');

  return (
    <MonthContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        currencySymbol,
        setCurrencySymbol,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
};
