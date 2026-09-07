from decimal import Decimal
from datetime import datetime, date
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile, Category, Transaction, Budget, SavingsGoal, GoalContribution, RecurringExpense
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    SavingsGoalSerializer,
    GoalContributionSerializer,
    RecurringExpenseSerializer,
)
from .services import calculate_dashboard_metrics, calculate_detailed_insights, parse_month


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = UserSerializer(user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()


        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Account created successfully!'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Both old and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'error': 'Current password is not correct.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated successfully.'})


class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):

        return Category.objects.filter(Q(user=self.request.user) | Q(user__isnull=True)).distinct().order_by('type', 'name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_default=False)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'error': 'Cannot delete system default categories.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related('category')


        month = self.request.query_params.get('month')
        if month:
            try:
                _, _, start_date, end_date, _ = parse_month(month)
                qs = qs.filter(date__gte=start_date, date__lte=end_date)
            except Exception:
                pass

        start_date_param = self.request.query_params.get('start_date')
        if start_date_param:
            qs = qs.filter(date__gte=start_date_param)

        end_date_param = self.request.query_params.get('end_date')
        if end_date_param:
            qs = qs.filter(date__lte=end_date_param)

        tx_type = self.request.query_params.get('type')
        if tx_type in ['income', 'expense']:
            qs = qs.filter(type=tx_type)

        category_id = self.request.query_params.get('category_id')
        if category_id:
            qs = qs.filter(category_id=category_id)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(description__icontains=search) | Q(notes__icontains=search) | Q(category__name__icontains=search))

        return qs.order_by('-date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        month = self.request.query_params.get('month')
        if not month:
            now = timezone.now().date()
            month = f"{now.year:04d}-{now.month:02d}"

        year, m, start_date, end_date, _ = parse_month(month)


        budgets = Budget.objects.filter(user=self.request.user, month=month).select_related('category')

        for b in budgets:
            spent = (
                Transaction.objects.filter(
                    user=self.request.user,
                    category=b.category,
                    type='expense',
                    date__gte=start_date,
                    date__lte=end_date
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            )
            b.spent = spent
            b.remaining = max(Decimal('0.00'), b.amount - spent)
            b.percentage = min(100.0, round(float((spent / b.amount) * 100), 1)) if b.amount > Decimal('0.00') else 0.0

        return budgets

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='copy-previous')
    def copy_previous_month(self, request):
        target_month = request.data.get('target_month')
        if not target_month:
            return Response({'error': 'target_month is required (YYYY-MM)'}, status=status.HTTP_400_BAD_REQUEST)

        year, month, _, _, _ = parse_month(target_month)
        if month == 1:
            prev_month = f"{year - 1:04d}-12"
        else:
            prev_month = f"{year:04d}-{month - 1:02d}"

        prev_budgets = Budget.objects.filter(user=request.user, month=prev_month)
        if not prev_budgets.exists():
            return Response({'error': f'No budgets found in previous month ({prev_month}) to copy.'}, status=status.HTTP_404_NOT_FOUND)

        copied_count = 0
        for pb in prev_budgets:
            obj, created = Budget.objects.update_or_create(
                user=request.user,
                category=pb.category,
                month=target_month,
                defaults={'amount': pb.amount}
            )
            if created:
                copied_count += 1

        return Response({
            'message': f'Successfully copied {copied_count} budget(s) from {prev_month} to {target_month}.',
            'copied_count': copied_count
        })


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user).prefetch_related('contributions').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        goal = self.get_object()
        amount_str = request.data.get('amount')
        notes = request.data.get('notes', '')
        date_str = request.data.get('date') or timezone.now().date().isoformat()
        log_transaction = request.data.get('log_transaction', True)

        try:
            amount = Decimal(str(amount_str))
            if amount <= Decimal('0.00'):
                raise ValueError
        except Exception:
            return Response({'error': 'Valid positive amount is required.'}, status=status.HTTP_400_BAD_REQUEST)


        contribution = GoalContribution.objects.create(
            goal=goal,
            amount=amount,
            date=date_str,
            notes=notes
        )


        goal.current_amount += amount
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        goal.save()


        if log_transaction:

            savings_cat, _ = Category.objects.get_or_create(
                user=request.user,
                name="Savings Goal Contribution",
                type="expense",
                defaults={"icon": "target", "color": "#10b981", "is_default": False}
            )
            Transaction.objects.create(
                user=request.user,
                category=savings_cat,
                amount=amount,
                type="expense",
                date=date_str,
                description=f"Savings: {goal.name}",
                notes=notes or f"Contribution towards {goal.name}"
            )

        serializer = self.get_serializer(goal)
        return Response({
            'message': f'Successfully contributed {amount} to {goal.name}!',
            'goal': serializer.data
        })


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringExpenseSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user).select_related('category').order_by('due_day', 'name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def log_payment(self, request, pk=None):
        recurring = self.get_object()
        today = timezone.now().date()
        date_str = request.data.get('date') or today.isoformat()


        tx = Transaction.objects.create(
            user=request.user,
            category=recurring.category,
            amount=recurring.amount,
            type='expense',
            date=date_str,
            description=f"Recurring: {recurring.name}",
            notes=f"Auto-logged recurring payment ({recurring.frequency})",
            is_recurring_instance=True
        )


        recurring.last_logged_date = today
        recurring.save()

        return Response({
            'message': f'Payment of {recurring.amount} logged for {recurring.name}!',
            'transaction_id': tx.id,
            'recurring': RecurringExpenseSerializer(recurring).data
        })


class DashboardSummaryView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        month = request.query_params.get('month')
        data = calculate_dashboard_metrics(request.user, month)
        return Response(data)


class InsightsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        month = request.query_params.get('month')
        data = calculate_detailed_insights(request.user, month)
        return Response(data)
