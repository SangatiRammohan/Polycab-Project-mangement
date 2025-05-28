from rest_framework import serializers
from .models import Task, Milestone
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with task count
    """
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_active', 'task_count']
    
    def get_task_count(self, obj):
        """Get count of tasks assigned to this user"""
        return obj.assigned_tasks.count()


class MilestoneSerializer(serializers.ModelSerializer):
    """
    Serializer for Milestone model
    """
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Milestone
        fields = ['id', 'name', 'code', 'description', 'task_count']
    
    def get_task_count(self, obj):
        """Get count of tasks for this milestone"""
        return Task.objects.filter(milestone=obj.code).count()


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model
    """
    # Add display fields for frontend
    milestone_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'subtasks', 'milestone', 'milestone_name',
            'assigned_to', 'assigned_to_name', 'status', 'status_display',
            'state', 'business_area', 'district', 'block',
            'start_date', 'estimated_end_date', 'completed_date',
            'created_at', 'updated_at'
        ]
    
    def get_milestone_name(self, obj):
        """Get display name for milestone"""
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
    # tasks/serializers.py
class TaskSerializer(serializers.ModelSerializer):
    assignedTo = serializers.StringRelatedField()  # or serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

    def get_assigned_to_name(self, obj):
        """Get display name for assigned user"""
        if not obj.assigned_to:
            return None
        return obj.assigned_to.full_name or obj.assigned_to.username
    
    def get_status_display(self, obj):
        """Get display text for status"""
        status_display = {
            'nil': 'Nil',
            'in_progress': 'In Progress',
            'completed': 'Completed'
        }
        return status_display.get(obj.status, obj.status)
    
    def validate(self, data):
        """
        Custom validation for task data
        """
        # Ensure start_date is not after estimated_end_date
        if 'start_date' in data and 'estimated_end_date' in data:
            if data['start_date'] > data['estimated_end_date']:
                raise serializers.ValidationError(
                    "Start date cannot be after estimated end date."
                )
        
        # If status is 'completed', set completed_date if not provided
        if data.get('status') == 'completed' and not data.get('completed_date'):
            from django.utils import timezone
            data['completed_date'] = timezone.now().date()
        
        return data


class TaskCreateSerializer(TaskSerializer):
    """
    Serializer for creating tasks with simpler validation
    """
    class Meta(TaskSerializer.Meta):
        # Exclude read-only fields for creation
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_date']


class TaskUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating task status
    """
    class Meta:
        model = Task
        fields = ['status']
        
    def validate_status(self, value):
        """
        Validate status transitions
        """
        valid_statuses = ['nil', 'in_progress', 'completed']
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(valid_statuses)}"
            )
        return value
