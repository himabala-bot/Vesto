from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Category

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Housing & Rent", "icon": "home", "color": "#6366f1"},
    {"name": "Groceries", "icon": "shopping-cart", "color": "#10b981"},
    {"name": "Dining & Drinks", "icon": "utensils", "color": "#f59e0b"},
    {"name": "Utilities & Bills", "icon": "zap", "color": "#0ea5e9"},
    {"name": "Transportation", "icon": "car", "color": "#8b5cf6"},
    {"name": "Subscriptions", "icon": "repeat", "color": "#ec4899"},
    {"name": "Entertainment", "icon": "film", "color": "#f43f5e"},
    {"name": "Health & Fitness", "icon": "activity", "color": "#14b8a6"},
    {"name": "Shopping & Tech", "icon": "shopping-bag", "color": "#eab308"},
    {"name": "Personal Care", "icon": "smile", "color": "#a855f7"},
    {"name": "General & Other", "icon": "layers", "color": "#64748b"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "Primary Salary", "icon": "briefcase", "color": "#10b981"},
    {"name": "Freelance & Consulting", "icon": "laptop", "color": "#06b6d4"},
    {"name": "Investments & Dividends", "icon": "trending-up", "color": "#84cc16"},
    {"name": "Gifts & Bonuses", "icon": "gift", "color": "#f59e0b"},
    {"name": "Other Income", "icon": "plus-circle", "color": "#64748b"},
]

@receiver(post_save, sender=User)
def create_user_defaults(sender, instance, created, **kwargs):
    if created:
        # Create user profile
        UserProfile.objects.get_or_create(user=instance)

        # Create user-specific default categories so user can freely customize/edit them
        for item in DEFAULT_EXPENSE_CATEGORIES:
            Category.objects.get_or_create(
                user=instance,
                name=item["name"],
                type="expense",
                defaults={
                    "icon": item["icon"],
                    "color": item["color"],
                    "is_default": True
                }
            )

        for item in DEFAULT_INCOME_CATEGORIES:
            Category.objects.get_or_create(
                user=instance,
                name=item["name"],
                type="income",
                defaults={
                    "icon": item["icon"],
                    "color": item["color"],
                    "is_default": True
                }
            )
