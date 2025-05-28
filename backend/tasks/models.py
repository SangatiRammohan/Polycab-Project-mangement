from django.db import models
from django.utils import timezone
from django.conf import settings


class Milestone(models.Model):
    """
    Milestone model representing different project phases
    """
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class Task(models.Model):
    """
    Task model for tracking work items
    """
    # Status choices
    STATUS_CHOICES = [
        ('nil', 'Nil'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    # Milestone choices based on the mapping in the React component
    MILESTONE_CHOICES = [
        ('desktop_survey_design', 'Desktop Survey Design'),
        ('network_health_checkup', 'Network Health Checkup'),
        ('hoto_existing', 'HOTO-Existing'),
        ('detailed_design', 'Detailed Design'),
        ('row', 'ROW (Right of Way)'),
        ('ifc', 'IFC (Issued for Construction)'),
        ('ic', 'IC (Initial Construction)'),
        ('as_built', 'As-Built'),
        ('hoto_final', 'HOTO (Final)'),
        ('field_survey', 'Field Survey'),
    ]
    
    # Task information
    title = models.CharField(max_length=255)
    subtasks = models.TextField(blank=True)
    milestone = models.CharField(max_length=50, choices=MILESTONE_CHOICES)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='in_progress'
    )
    
    # Location details
    state = models.CharField(max_length=100)
    business_area = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    block = models.CharField(max_length=100)
    
    # Timeline
    start_date = models.DateField()
    estimated_end_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Set completed_date when status changes to completed
        if self.status == 'completed' and not self.completed_date:
            self.completed_date = timezone.now().date()
        # Clear completed_date if status is not completed
        elif self.status != 'completed':
            self.completed_date = None
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-start_date', 'title']
