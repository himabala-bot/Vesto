from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import api.signals
        import os
        from django.db.models.signals import post_migrate
        from django.contrib.auth import get_user_model

        def create_admin_user(sender, **kwargs):
            username = os.getenv('ADMIN_USERNAME')
            email = os.getenv('ADMIN_EMAIL')
            password = os.getenv('ADMIN_PASSWORD')
            if not all([username, email, password]):
                return
            User = get_user_model()
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(username=username, email=email, password=password)
                print("✅ Production admin superuser created.")
            else:
                print("ℹ️ Admin superuser already exists.")

        post_migrate.connect(create_admin_user, sender=self.__class__)
