from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    CurrentUserView,
    ChangePasswordView,
    UserProfileSettingsView,
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    SavingsGoalViewSet,
    RecurringExpenseViewSet,
    DashboardSummaryView,
    InsightsView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', SavingsGoalViewSet, basename='goal')
router.register(r'recurring', RecurringExpenseViewSet, basename='recurring')

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    
    # Settings
    path('settings/', UserProfileSettingsView.as_view(), name='user_settings'),
    
    # Analytics & Dashboards
    path('analytics/dashboard/', DashboardSummaryView.as_view(), name='analytics_dashboard'),
    path('analytics/insights/', InsightsView.as_view(), name='analytics_insights'),
    
    # ViewSets (Categories, Transactions, Budgets, Goals, Recurring)
    path('', include(router.urls)),
]
