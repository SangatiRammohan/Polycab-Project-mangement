from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'email', 'phone', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'full_name', 'email', 'phone')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'phone')}),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'full_name', 'email', 'phone', 'role', 'password1', 'password2'),
        }),
    )

    def role_display(self, obj):
        """Display the role with appropriate styling"""
        role_styles = {
            'admin': 'background-color: #e53935; color: white;',
            'project_manager': 'background-color: #43a047; color: white;',
            'site_manager': 'background-color: #1e88e5; color: white;',
            'surveyor': 'background-color: #fb8c00; color: white;',
            'row_coordinator': 'background-color: #8e24aa; color: white;',
            'quality_inspector': 'background-color: #00acc1; color: white;',
            'user': 'background-color: #546e7a; color: white;',
            'viewer': 'background-color: #757575; color: white;',
        }
        
        style = role_styles.get(obj.role.lower(), 'background-color: #757575; color: white;')
        return format_html('<span style="padding: 3px 8px; border-radius: 3px; {}">{}</span>', 
                          style, obj.role.replace('_', ' ').title())
    
    role_display.short_description = 'Role'