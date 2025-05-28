from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(max_length=20, blank=True, null=True, verbose_name='Phone Number'),
        ),
    ]
