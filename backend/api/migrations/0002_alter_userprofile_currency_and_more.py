

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='currency',
            field=models.CharField(default='INR', max_length=10),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='currency_symbol',
            field=models.CharField(default='₹', max_length=5),
        ),
    ]
