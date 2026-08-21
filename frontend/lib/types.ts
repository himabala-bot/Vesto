export interface UserProfile {
  id: number;
  currency: string;
  currency_symbol: string;
  monthly_income_target: string | number;
  monthly_savings_target: string | number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  category: number | null;
  category_details?: Category;
  amount: string | number;
  type: 'expense' | 'income';
  date: string;
  description: string;
  notes?: string;
  is_recurring_instance?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  category: number;
  category_details?: Category;
  amount: string | number;
  month: string; // 'YYYY-MM'
  spent?: number;
  remaining?: number;
  percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: number;
  goal: number;
  amount: string | number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: string | number;
  current_amount: string | number;
  remaining_amount?: number;
  target_date: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  progress_percentage: number;
  contributions?: GoalContribution[];
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: number;
  category: number | null;
  category_details?: Category;
  name: string;
  amount: string | number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  due_day: number;
  next_due_date?: string | null;
  is_active: boolean;
  last_logged_date?: string | null;
  days_until_due?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SafeToSpendBreakdown {
  safe_month: number;
  safe_daily: number;
  safe_weekly: number;
  status: 'on_track' | 'caution' | 'exceeded' | 'unconfigured';
  message: string;
  effective_income: number;
  committed_recurring: number;
  savings_target: number;
  total_spent: number;
  remaining_days: number;
  days_passed: number;
  days_in_month: number;
}

export interface DashboardMetrics {
  month: string;
  month_label: string;
  currency: string;
  currency_symbol: string;
  has_data: boolean;
  all_time_balance: number;
  month_summary: {
    income: number;
    expense: number;
    net_savings: number;
    savings_rate: number;
  };
  safe_to_spend: SafeToSpendBreakdown;
  spending_by_category: {
    category_id: number;
    name: string;
    color: string;
    icon: string;
    spent: number;
    budget: number;
    remaining: number;
    percentage: number;
  }[];
  upcoming_recurring: {
    id: number;
    name: string;
    amount: number;
    frequency: string;
    due_day: number;
    due_date: string;
    is_paid: boolean;
    days_away: number;
    category_name: string;
  }[];
  goals_preview: {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    progress_percentage: number;
    target_date: string | null;
    icon: string;
    color: string;
    is_completed: boolean;
  }[];
  recent_transactions: {
    id: number;
    description: string;
    amount: number;
    type: 'expense' | 'income';
    date: string;
    category_name: string;
    category_color: string;
    category_icon: string;
  }[];
  cashflow_trend: {
    month: string;
    year_month: string;
    income: number;
    expense: number;
    savings: number;
  }[];
}

export interface InsightsData {
  month: string;
  month_label: string;
  currency_symbol: string;
  current_summary: {
    income: number;
    expense: number;
    net_savings: number;
    mom_change_percentage: number;
  };
  previous_summary: {
    income: number;
    expense: number;
  };
  velocity_data: {
    day: number;
    current_month: number | null;
    previous_month: number | null;
  }[];
  category_insights: {
    category_id: number;
    name: string;
    color: string;
    amount: number;
    percentage: number;
    previous_month_amount: number;
    mom_change_percentage: number | null;
  }[];
  smart_alerts: {
    type: 'info' | 'success' | 'warning' | 'danger';
    title: string;
    description: string;
    action_label?: string;
    action_link?: string;
  }[];
}
