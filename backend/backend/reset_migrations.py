# reset_migrations.py
import os
import sys
import django

# Add the outer backend directory to sys.path to fix ModuleNotFoundError
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("DELETE FROM django_migrations WHERE app = 'admin';")
    cursor.execute("DELETE FROM django_migrations WHERE app = 'users';")
    print("Migration records deleted successfully.")