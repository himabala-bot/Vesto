from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date

from .models import Category, Transaction, Budget, SavingsGoal, RecurringExpense, UserProfile
from .services import calculate_dashboard_metrics, calculate_detailed_insights


class VestoBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@vesto.app',
            password='testpassword123',
            first_name='Alex'
        )

        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpassword123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_default_categories_and_profile_created(self):
        profile = UserProfile.objects.filter(user=self.user).first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.currency_symbol, '₹')
        self.assertEqual(profile.currency, 'INR')

        categories = Category.objects.filter(user=self.user)
        self.assertGreater(categories.count(), 5)
        self.assertTrue(categories.filter(type='expense').exists())
        self.assertTrue(categories.filter(type='income').exists())

    def test_empty_state_dashboard_returns_zeroes_and_unconfigured(self):
        metrics = calculate_dashboard_metrics(self.user, '2026-08')
        self.assertFalse(metrics['has_data'])
        self.assertEqual(metrics['all_time_balance'], 0.0)
        self.assertEqual(metrics['month_summary']['income'], 0.0)
        self.assertEqual(metrics['month_summary']['expense'], 0.0)
        self.assertEqual(metrics['safe_to_spend']['status'], 'unconfigured')

    def test_transaction_crud_and_balance_update(self):

        income_cat = Category.objects.filter(user=self.user, type='income').first()
        res = self.client.post('/api/transactions/', {
            'category': income_cat.id,
            'amount': '5000.00',
            'type': 'income',
            'date': '2026-08-01',
            'description': 'Tech Job Salary'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


        exp_cat = Category.objects.filter(user=self.user, type='expense').first()
        res_exp = self.client.post('/api/transactions/', {
            'category': exp_cat.id,
            'amount': '1200.00',
            'type': 'expense',
            'date': '2026-08-05',
            'description': 'Monthly Grocery & Supplies'
        })
        self.assertEqual(res_exp.status_code, status.HTTP_201_CREATED)


        res_dash = self.client.get('/api/analytics/dashboard/?month=2026-08')
        self.assertEqual(res_dash.status_code, status.HTTP_200_OK)
        data = res_dash.data
        self.assertEqual(data['has_data'], True)
        self.assertEqual(data['all_time_balance'], 3800.0)
        self.assertEqual(data['month_summary']['income'], 5000.0)
        self.assertEqual(data['month_summary']['expense'], 1200.0)
        self.assertGreater(data['safe_to_spend']['safe_month'], 0)

    def test_recurring_expense_log_payment(self):
        exp_cat = Category.objects.filter(user=self.user, type='expense').first()
        recurring = RecurringExpense.objects.create(
            user=self.user,
            category=exp_cat,
            name='Gym Membership',
            amount=Decimal('45.00'),
            frequency='monthly',
            due_day=10
        )

        res = self.client.post(f'/api/recurring/{recurring.id}/log_payment/', {
            'date': '2026-08-10'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)


        tx = Transaction.objects.filter(user=self.user, description__contains='Gym Membership').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, Decimal('45.00'))

    def test_savings_goal_contribution(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            name='Emergency Fund',
            target_amount=Decimal('10000.00'),
            current_amount=Decimal('1000.00'),
            target_date=date(2026, 12, 31)
        )

        res = self.client.post(f'/api/goals/{goal.id}/contribute/', {
            'amount': '500.00',
            'notes': 'August bonus contribution'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        goal.refresh_from_db()
        self.assertEqual(goal.current_amount, Decimal('1500.00'))
        self.assertEqual(goal.progress_percentage, 15.0)

    def test_copy_budgets_from_previous_month(self):
        exp_cat1 = Category.objects.filter(user=self.user, type='expense')[0]
        exp_cat2 = Category.objects.filter(user=self.user, type='expense')[1]

        Budget.objects.create(user=self.user, category=exp_cat1, amount=Decimal('600.00'), month='2026-07')
        Budget.objects.create(user=self.user, category=exp_cat2, amount=Decimal('250.00'), month='2026-07')

        res = self.client.post('/api/budgets/copy-previous/', {
            'target_month': '2026-08'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['copied_count'], 2)

        aug_budgets = Budget.objects.filter(user=self.user, month='2026-08')
        self.assertEqual(aug_budgets.count(), 2)
