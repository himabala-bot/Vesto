import calendar
from datetime import datetime, date, timedelta
from decimal import Decimal
from django.db.models import Sum, Q
from django.utils import timezone
from .models import Transaction, Budget, SavingsGoal, RecurringExpense, Category, UserProfile


def parse_month(month_str=None):
    """
    Parses 'YYYY-MM' string into (year, month, start_date, end_date, days_in_month).
    Defaults to current UTC/local month if None or invalid.
    """
    now = timezone.now().date()
    if not month_str:
        year, month = now.year, now.month
    else:
        try:
            parts = month_str.split('-')
            year, month = int(parts[0]), int(parts[1])
            if not (1 <= month <= 12):
                raise ValueError
        except Exception:
            year, month = now.year, now.month

    days_in_month = calendar.monthrange(year, month)[1]
    start_date = date(year, month, 1)
    end_date = date(year, month, days_in_month)
    return year, month, start_date, end_date, days_in_month


def calculate_dashboard_metrics(user, month_str=None):
    year, month, start_date, end_date, days_in_month = parse_month(month_str)
    selected_month_str = f"{year:04d}-{month:02d}"
    today = timezone.now().date()


    profile, _ = UserProfile.objects.get_or_create(user=user)
    currency_symbol = profile.currency_symbol or '₹'
    currency = profile.currency or 'INR'


    all_time_income = Transaction.objects.filter(user=user, type='income').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    all_time_expense = Transaction.objects.filter(user=user, type='expense').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    all_time_balance = all_time_income - all_time_expense


    month_txs = Transaction.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
    month_income = month_txs.filter(type='income').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    month_expense = month_txs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    month_net_savings = month_income - month_expense


    if month_income > Decimal('0.00'):
        savings_rate = round(float((month_net_savings / month_income) * Decimal('100.0')), 1)
    else:
        savings_rate = 0.0


    recurring_qs = RecurringExpense.objects.filter(user=user, is_active=True)
    total_recurring_monthly = Decimal('0.00')
    for r in recurring_qs:
        if r.frequency == 'monthly':
            total_recurring_monthly += r.amount
        elif r.frequency == 'weekly':
            total_recurring_monthly += r.amount * Decimal('4.33')
        elif r.frequency == 'yearly':
            total_recurring_monthly += r.amount / Decimal('12.0')
    total_recurring_monthly = round(total_recurring_monthly, 2)


    budgets_qs = Budget.objects.filter(user=user, month=selected_month_str)
    total_budgeted = budgets_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')


    monthly_savings_target = profile.monthly_savings_target or Decimal('0.00')


    effective_income = month_income if month_income > Decimal('0.00') else profile.monthly_income_target
    has_financial_baseline = (effective_income > Decimal('0.00') or month_expense > Decimal('0.00') or total_recurring_monthly > Decimal('0.00'))


    if today.year == year and today.month == month:
        remaining_days = max(1, days_in_month - today.day + 1)
        days_passed = today.day
    elif (today.year > year) or (today.year == year and today.month > month):
        remaining_days = 1
        days_passed = days_in_month
    else:
        remaining_days = days_in_month
        days_passed = 0


    discretionary_pool = max(Decimal('0.00'), effective_income - total_recurring_monthly - monthly_savings_target)


    safe_to_spend_month = max(Decimal('0.00'), discretionary_pool - month_expense)

    safe_to_spend_daily = round(safe_to_spend_month / Decimal(str(remaining_days)), 2)
    safe_to_spend_weekly = round(min(safe_to_spend_month, safe_to_spend_daily * Decimal('7.0')), 2)


    if not has_financial_baseline and month_txs.count() == 0:
        pacing_status = 'unconfigured'
        pacing_message = 'Add your income or transactions to calculate your Safe to Spend.'
    elif effective_income > Decimal('0.00') and month_expense > effective_income:
        pacing_status = 'exceeded'
        pacing_message = f'You have exceeded your total monthly income by {currency_symbol}{float(month_expense - effective_income):,.2f}.'
    elif discretionary_pool > Decimal('0.00') and safe_to_spend_month <= Decimal('0.00'):
        pacing_status = 'exceeded'
        pacing_message = 'Your discretionary spending limit for this month has been reached.'
    elif discretionary_pool > Decimal('0.00') and (safe_to_spend_month / discretionary_pool) < Decimal('0.20'):
        pacing_status = 'caution'
        pacing_message = f'Safe spending buffer is running low. {currency_symbol}{float(safe_to_spend_daily):,.2f} daily allowance left.'
    else:
        pacing_status = 'on_track'
        pacing_message = f'You are on track! You can safely spend {currency_symbol}{float(safe_to_spend_daily):,.2f} per day.'


    categories_qs = Category.objects.filter(Q(user=user) | Q(user__isnull=True), type='expense').distinct()
    spending_by_category = []


    budget_map = {b.category_id: b.amount for b in budgets_qs}


    cat_expenses = (
        Transaction.objects.filter(user=user, type='expense', date__gte=start_date, date__lte=end_date)
        .values('category_id', 'category__name', 'category__color', 'category__icon')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )

    for ce in cat_expenses:
        cat_id = ce['category_id']
        cat_name = ce['category__name'] or 'Uncategorized'
        cat_color = ce['category__color'] or '#64748b'
        cat_icon = ce['category__icon'] or 'tag'
        spent = ce['total'] or Decimal('0.00')
        budget_amt = budget_map.get(cat_id, Decimal('0.00'))

        pct = round(float((spent / budget_amt) * 100), 1) if budget_amt > Decimal('0.00') else 0.0
        remaining_cat = max(Decimal('0.00'), budget_amt - spent) if budget_amt > Decimal('0.00') else Decimal('0.00')

        spending_by_category.append({
            'category_id': cat_id,
            'name': cat_name,
            'color': cat_color,
            'icon': cat_icon,
            'spent': float(spent),
            'budget': float(budget_amt),
            'remaining': float(remaining_cat),
            'percentage': pct,
        })


    upcoming_recurring = []
    for r in recurring_qs.order_by('due_day'):
        try:
            bill_date = date(year, month, min(r.due_day, days_in_month))
        except ValueError:
            bill_date = date(year, month, days_in_month)

        is_paid = r.last_logged_date is not None and (r.last_logged_date.year == year and r.last_logged_date.month == month)
        days_away = (bill_date - today).days if today.year == year and today.month == month else 0

        upcoming_recurring.append({
            'id': r.id,
            'name': r.name,
            'amount': float(r.amount),
            'frequency': r.frequency,
            'due_day': r.due_day,
            'due_date': bill_date.isoformat(),
            'is_paid': is_paid,
            'days_away': days_away,
            'category_name': r.category.name if r.category else 'Bill',
        })


    goals_qs = SavingsGoal.objects.filter(user=user).order_by('-created_at')[:4]
    goals_preview = []
    for g in goals_qs:
        goals_preview.append({
            'id': g.id,
            'name': g.name,
            'target_amount': float(g.target_amount),
            'current_amount': float(g.current_amount),
            'progress_percentage': g.progress_percentage,
            'target_date': g.target_date.isoformat() if g.target_date else None,
            'icon': g.icon,
            'color': g.color,
            'is_completed': g.is_completed,
        })


    recent_txs_qs = Transaction.objects.filter(user=user).select_related('category')[:6]
    recent_transactions = []
    for tx in recent_txs_qs:
        recent_transactions.append({
            'id': tx.id,
            'description': tx.description,
            'amount': float(tx.amount),
            'type': tx.type,
            'date': tx.date.isoformat(),
            'category_name': tx.category.name if tx.category else 'General',
            'category_color': tx.category.color if tx.category else '#64748b',
            'category_icon': tx.category.icon if tx.category else 'tag',
        })


    cashflow_trend = []
    for i in range(5, -1, -1):

        month_offset_date = (start_date.replace(day=1) - timedelta(days=i * 28)).replace(day=1)
        m_year, m_month = month_offset_date.year, month_offset_date.month
        m_days = calendar.monthrange(m_year, m_month)[1]
        m_start = date(m_year, m_month, 1)
        m_end = date(m_year, m_month, m_days)
        m_label = m_start.strftime('%b')

        m_inc = Transaction.objects.filter(user=user, type='income', date__gte=m_start, date__lte=m_end).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        m_exp = Transaction.objects.filter(user=user, type='expense', date__gte=m_start, date__lte=m_end).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        cashflow_trend.append({
            'month': m_label,
            'year_month': f"{m_year:04d}-{m_month:02d}",
            'income': float(m_inc),
            'expense': float(m_exp),
            'savings': float(m_inc - m_exp),
        })

    return {
        'month': selected_month_str,
        'month_label': start_date.strftime('%B %Y'),
        'currency': currency,
        'currency_symbol': currency_symbol,
        'has_data': month_txs.exists() or Transaction.objects.filter(user=user).exists(),
        'all_time_balance': float(all_time_balance),
        'month_summary': {
            'income': float(month_income),
            'expense': float(month_expense),
            'net_savings': float(month_net_savings),
            'savings_rate': savings_rate,
        },
        'safe_to_spend': {
            'safe_month': float(safe_to_spend_month),
            'safe_daily': float(safe_to_spend_daily),
            'safe_weekly': float(safe_to_spend_weekly),
            'status': pacing_status,
            'message': pacing_message,
            'effective_income': float(effective_income),
            'committed_recurring': float(total_recurring_monthly),
            'savings_target': float(monthly_savings_target),
            'total_spent': float(month_expense),
            'remaining_days': remaining_days,
            'days_passed': days_passed,
            'days_in_month': days_in_month,
        },
        'spending_by_category': spending_by_category,
        'upcoming_recurring': upcoming_recurring,
        'goals_preview': goals_preview,
        'recent_transactions': recent_transactions,
        'cashflow_trend': cashflow_trend,
    }


def calculate_detailed_insights(user, month_str=None):
    year, month, start_date, end_date, days_in_month = parse_month(month_str)
    selected_month_str = f"{year:04d}-{month:02d}"
    today = timezone.now().date()

    profile, _ = UserProfile.objects.get_or_create(user=user)
    currency_symbol = profile.currency_symbol or '₹'


    current_txs = Transaction.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
    current_income = current_txs.filter(type='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
    current_expense = current_txs.filter(type='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')


    prev_month_end = start_date - timedelta(days=1)
    prev_year, prev_month = prev_month_end.year, prev_month_end.month
    prev_days = calendar.monthrange(prev_year, prev_month)[1]
    prev_start = date(prev_year, prev_month, 1)

    prev_txs = Transaction.objects.filter(user=user, date__gte=prev_start, date__lte=prev_month_end)
    prev_income = prev_txs.filter(type='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
    prev_expense = prev_txs.filter(type='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')


    if prev_expense > Decimal('0.00'):
        expense_mom_change_pct = round(float(((current_expense - prev_expense) / prev_expense) * 100), 1)
    else:
        expense_mom_change_pct = 0.0


    velocity_data = []
    current_running_sum = Decimal('0.00')
    prev_running_sum = Decimal('0.00')

    current_expenses_by_day = {}
    for tx in current_txs.filter(type='expense'):
        current_expenses_by_day[tx.date.day] = current_expenses_by_day.get(tx.date.day, Decimal('0.00')) + tx.amount

    prev_expenses_by_day = {}
    for tx in prev_txs.filter(type='expense'):
        prev_expenses_by_day[tx.date.day] = prev_expenses_by_day.get(tx.date.day, Decimal('0.00')) + tx.amount

    max_days = max(days_in_month, prev_days)
    for d in range(1, max_days + 1):
        if d <= days_in_month:
            current_running_sum += current_expenses_by_day.get(d, Decimal('0.00'))
            curr_val = float(current_running_sum) if (start_date.year < today.year or (start_date.year == today.year and start_date.month < today.month) or d <= today.day) else None
        else:
            curr_val = None

        if d <= prev_days:
            prev_running_sum += prev_expenses_by_day.get(d, Decimal('0.00'))
            prev_val = float(prev_running_sum)
        else:
            prev_val = None

        velocity_data.append({
            'day': d,
            'current_month': curr_val,
            'previous_month': prev_val,
        })


    category_insights = []
    cat_expenses = (
        current_txs.filter(type='expense')
        .values('category_id', 'category__name', 'category__color')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )

    for ce in cat_expenses:
        cat_id = ce['category_id']
        name = ce['category__name'] or 'Uncategorized'
        total = ce['total'] or Decimal('0.00')
        pct_of_total = round(float((total / current_expense) * 100), 1) if current_expense > Decimal('0.00') else 0.0


        prev_cat_total = (
            prev_txs.filter(type='expense', category_id=cat_id).aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        )
        if prev_cat_total > Decimal('0.00'):
            mom_pct = round(float(((total - prev_cat_total) / prev_cat_total) * 100), 1)
        else:
            mom_pct = None

        category_insights.append({
            'category_id': cat_id,
            'name': name,
            'color': ce['category__color'] or '#64748b',
            'amount': float(total),
            'percentage': pct_of_total,
            'previous_month_amount': float(prev_cat_total),
            'mom_change_percentage': mom_pct,
        })


    smart_alerts = []

    if current_txs.count() == 0:
        smart_alerts.append({
            'type': 'info',
            'title': 'No data recorded for this month',
            'description': 'Start logging your daily expenses or income to generate personalized spending intelligence.',
            'action_label': 'Add Transaction',
            'action_link': '/transactions'
        })
    else:

        if current_income > Decimal('0.00'):
            savings_pct = round(float(((current_income - current_expense) / current_income) * 100), 1)
            if savings_pct >= 20.0:
                smart_alerts.append({
                    'type': 'success',
                    'title': f'Strong Savings Rate ({savings_pct}%)',
                    'description': f'You are saving {savings_pct}% of your income this month, exceeding the healthy 20% benchmark.',
                })
            elif savings_pct > 0:
                smart_alerts.append({
                    'type': 'warning',
                    'title': f'Moderate Savings Rate ({savings_pct}%)',
                    'description': f'Your savings rate is currently {savings_pct}%. Trimming discretionary expenses could boost this toward the 20% target.',
                })
            else:
                smart_alerts.append({
                    'type': 'danger',
                    'title': 'Deficit Spending Warning',
                    'description': f'Expenses have exceeded income by {currency_symbol}{float(current_expense - current_income):,.2f}. Review upcoming payments and non-essential spending.',
                })


        if category_insights:
            top_cat = category_insights[0]
            if top_cat['percentage'] > 35.0:
                smart_alerts.append({
                    'type': 'warning',
                    'title': f'High Concentration in {top_cat["name"]}',
                    'description': f'{top_cat["name"]} accounts for {top_cat["percentage"]}% of your total outflow this month ({currency_symbol}{top_cat["amount"]:,.2f}).',
                })


        if prev_expense > Decimal('0.00'):
            if expense_mom_change_pct > 25.0:
                smart_alerts.append({
                    'type': 'warning',
                    'title': f'Spending Acceleration (+{expense_mom_change_pct}%)',
                    'description': f'Your total spending is {expense_mom_change_pct}% higher than the same period last month.',
                })
            elif expense_mom_change_pct < -15.0:
                smart_alerts.append({
                    'type': 'success',
                    'title': f'Disciplined Spending ({expense_mom_change_pct}%)',
                    'description': f'You have reduced your total outflow by {abs(expense_mom_change_pct)}% compared to last month!',
                })

    return {
        'month': selected_month_str,
        'month_label': start_date.strftime('%B %Y'),
        'currency_symbol': currency_symbol,
        'current_summary': {
            'income': float(current_income),
            'expense': float(current_expense),
            'net_savings': float(current_income - current_expense),
            'mom_change_percentage': expense_mom_change_pct,
        },
        'previous_summary': {
            'income': float(prev_income),
            'expense': float(prev_expense),
        },
        'velocity_data': velocity_data,
        'category_insights': category_insights,
        'smart_alerts': smart_alerts,
    }
