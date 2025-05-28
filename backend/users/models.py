from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """Custom user model manager for email rather than username"""
    
    def create_user(self, username, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model"""
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('project_manager', 'Project Manager'),
        ('site_manager', 'Site Manager'),
        ('surveyor', 'Surveyor'),
        ('row_coordinator', 'ROW Coordinator'),
        ('quality_inspector', 'Quality Inspector'),
        ('user', 'User'),
        ('viewer', 'Viewer'),
    )
    
    # Already has username, password fields from AbstractUser
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()
    
    REQUIRED_FIELDS = ['email']  # Username is already required by default
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"