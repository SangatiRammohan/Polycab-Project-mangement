from django.contrib import admin
from django.utils.html import format_html
from .models import Task, Milestone
from users.models import User


class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'milestone_display', 'assigned_to_display', 
                    'location_display', 'date_range', 'status_badge')
    list_filter = ('status', 'milestone', 'state')
    search_fields = ('title', 'subtasks', 'assigned_to__username', 'assigned_to__full_name', 
                     'state', 'business_area', 'district', 'block')
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'subtasks', 'milestone', 'assigned_to', 'status')
        }),
        ('Location Details', {
            'fields': ('state', 'business_area', 'district', 'block')
        }),
        ('Timeline', {
            'fields': ('start_date', 'estimated_end_date', 'completed_date')
        }),
    )
    
    def milestone_display(self, obj):
        """Display the milestone name"""
        milestone_names = {
            'desktop_survey_design': 'Desktop Survey Design',
            'network_health_checkup': 'Network Health Checkup',
            'hoto_existing': 'HOTO-Existing',
            'detailed_design': 'Detailed Design',
            'row': 'ROW (Right of Way)',
            'ifc': 'IFC (Issued for Construction)',
            'ic': 'IC (Initial Construction)',
            'as_built': 'As-Built',
            'hoto_final': 'HOTO (Final)',
            'field_survey': 'Field Survey'
        }
        return milestone_names.get(obj.milestone, obj.milestone)
    milestone_display.short_description = 'Milestone'
    
    def assigned_to_display(self, obj):
        """Display the assigned user's full name or username"""
        if not obj.assigned_to:
            return '—'
        return obj.assigned_to.full_name or obj.assigned_to.username
    assigned_to_display.short_description = 'Assigned To'
    
    def location_display(self, obj):
        """Display hierarchical location information"""
        parts = []
        if obj.state:
            parts.append(obj.state)
        if obj.business_area:
            parts.append(obj.business_area)
        if obj.district:
            parts.append(obj.district)
        if obj.block:
            parts.append(obj.block)
        return ' > '.join(parts) if parts else '—'
    location_display.short_description = 'Location'
    
    def date_range(self, obj):
        """Display start and end date as a range"""
        start = obj.start_date.strftime('%Y-%m-%d') if obj.start_date else '—'
        end = obj.estimated_end_date.strftime('%Y-%m-%d') if obj.estimated_end_date else '—'
        return f"{start} to {end}"
    date_range.short_description = 'Timeline'
    
    def status_badge(self, obj):
        """Display status as a colored badge"""
        colors = {
            'nil': '#6c757d',  # Gray
            'in_progress': '#17a2b8',  # Blue
            'completed': '#28a745',  # Green
        }
        status_display = {
            'nil': 'Nil',
            'in_progress': 'In Progress',
            'completed': 'Completed'
        }
        color = colors.get(obj.status, '#6c757d')
        display = status_display.get(obj.status, obj.status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 12px; font-size: 0.8em;">{}</span>',
            color, display
        )
    status_badge.short_description = 'Status'


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'email', 'is_active', 'task_count')
    list_filter = ('is_active',)
    search_fields = ('username', 'full_name', 'email')
    ordering = ('username',)
    
    def task_count(self, obj):
        """Count tasks assigned to this user"""
        count = obj.assigned_tasks.count()
        return count
    task_count.short_description = 'Assigned Tasks'


class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description', 'task_count')
    search_fields = ('name', 'code', 'description')
    
    def task_count(self, obj):
        """Count tasks for this milestone"""
        return Task.objects.filter(milestone=obj.code).count()
    task_count.short_description = 'Associated Tasks'


# Register models with custom admin classes
admin.site.register(Task, TaskAdmin)
# admin.site.register(User, UserAdmin)  # Commented out to avoid AlreadyRegistered error
admin.site.register(Milestone, MilestoneAdmin)
