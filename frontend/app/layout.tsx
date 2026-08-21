import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { MonthProvider } from '@/lib/month-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'VESTO - Modern Personal Finance & Safe to Spend',
  description: 'Understand and control your spending with real-time Safe to Spend intelligence, custom budgets, savings goals, and recurring bill tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          <MonthProvider>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #1e293b',
                },
              }}
            />
          </MonthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
