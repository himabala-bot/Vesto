import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined, symbol: string = '₹'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${symbol}0.00`;
  }
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number | string | null | undefined, symbol: string = '₹'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${symbol}0`;
  }
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formatted = '';
  if (absNum >= 1_00_00_000) {
    formatted = `${(absNum / 1_00_00_000).toFixed(2)}Cr`;
  } else if (absNum >= 1_00_000) {
    formatted = `${(absNum / 1_00_000).toFixed(2)}L`;
  } else if (absNum >= 1_000) {
    formatted = `${(absNum / 1_000).toFixed(1)}k`;
  } else {
    formatted = absNum.toFixed(0);
  }

  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthLabel(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-');
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return monthStr;
  }
}

export function getMonthOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();

  for (let i = -11; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}
