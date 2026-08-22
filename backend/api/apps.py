from django.apps import AppConfig
import os
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """
        Hook that ensures a superuser exists in production.
        Reads credentials from ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
        environment variables. Runs once after migrations and also
        immediately on app startup (covers the case where no migrations
        are applied).
        """
        def _create_admin_user(sender, **kwargs):
            username = os.getenv('ADMIN_USERNAME')
            email = os.getenv('ADMIN_EMAIL')
            password = os.getenv('ADMIN_PASSWORD')
            if not all([username, email, password]):
                return
            User = get_user_model()
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                )
                print("✅ Production admin superuser created.")
            else:
                print("ℹ️ Admin superuser already exists.")

        # Connect to post_migrate to run after any migrations
        post_migrate.connect(_create_admin_user, sender=self.__class__)

        # Also invoke immediately in case there are no pending migrations
        _create_admin_user(sender=self.__class__)

        # Load other app signals
        import api.signals
