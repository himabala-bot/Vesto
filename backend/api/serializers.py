from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Category, Transaction, Budget, SavingsGoal, GoalContribution, RecurringExpense


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('id', 'currency', 'currency_symbol', 'monthly_income_target', 'monthly_savings_target', 'created_at', 'updated_at')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    currency = serializers.CharField(write_only=True, required=False, default='INR')
    currency_symbol = serializers.CharField(write_only=True, required=False, default='₹')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'currency', 'currency_symbol')

    def create(self, validated_data):
        currency = validated_data.pop('currency', 'INR')
        currency_symbol = validated_data.pop('currency_symbol', '₹')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(password)
        user.save()

        # Update profile with chosen currency if provided
        if hasattr(user, 'profile'):
            user.profile.currency = currency
            user.profile.currency_symbol = currency_symbol
            user.profile.save()

        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'icon', 'color', 'is_default', 'created_at')
        read_only_fields = ('id', 'is_default', 'created_at')


class TransactionSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'category', 'category_details', 'amount', 'type',
            'date', 'description', 'notes', 'is_recurring_instance',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class BudgetSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)
    percentage = serializers.FloatField(read_only=True, default=0.0)

    class Meta:
        model = Budget
        fields = (
            'id', 'category', 'category_details', 'amount', 'month',
            'spent', 'remaining', 'percentage', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class GoalContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalContribution
        fields = ('id', 'goal', 'amount', 'date', 'notes', 'created_at')
        read_only_fields = ('id', 'created_at')


class SavingsGoalSerializer(serializers.ModelSerializer):
    contributions = GoalContributionSerializer(many=True, read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = (
            'id', 'name', 'target_amount', 'current_amount', 'remaining_amount',
            'target_date', 'icon', 'color', 'is_completed',
            'progress_percentage', 'contributions', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'progress_percentage', 'created_at', 'updated_at')

    def get_remaining_amount(self, obj):
        rem = obj.target_amount - obj.current_amount
        return max(float(rem), 0.0)


class RecurringExpenseSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    days_until_due = serializers.SerializerMethodField()

    class Meta:
        model = RecurringExpense
        fields = (
            'id', 'category', 'category_details', 'name', 'amount',
            'frequency', 'due_day', 'next_due_date', 'is_active',
            'last_logged_date', 'days_until_due', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'days_until_due', 'created_at', 'updated_at')

    def get_days_until_due(self, obj):
        from django.utils import timezone
        import datetime
        today = timezone.localdate() if hasattr(timezone, 'localdate') else timezone.now().date()
        
        # Calculate next due date if not explicitly set
        if obj.frequency == 'monthly':
            # Day in current month
            try:
                target_date = datetime.date(today.year, today.month, min(obj.due_day, 28))
            except ValueError:
                target_date = datetime.date(today.year, today.month, 28)
            if target_date < today:
                # Due in next month
                if today.month == 12:
                    target_date = datetime.date(today.year + 1, 1, min(obj.due_day, 28))
                else:
                    target_date = datetime.date(today.year, today.month + 1, min(obj.due_day, 28))
            return (target_date - today).days
        return None
