from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView

# Create a router for viewsets
router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'milestones', views.MilestoneViewSet)

# Define the urlpatterns for our API
urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Task-specific endpoints
    path('tasks/<int:pk>/update-status/', views.update_task_status, name='update-task-status'),
    
    # Location data endpoints
    path('location/states/', views.get_states, name='get-states'),
    path('location/business-areas/<str:state>/', views.get_business_areas, name='get-business-areas'),
    path('location/districts/<str:state>/<str:business_area>/', views.get_districts, name='get-districts'),
    path('location/blocks/<str:state>/<str:business_area>/<str:district>/', views.get_blocks, name='get-blocks'),
    
    # Dashboard endpoints
    path('dashboard/task-summary/', views.task_summary, name='task-summary'),
    path('dashboard/milestone-progress/', views.milestone_progress, name='milestone-progress'),
    path("alltasks/", views.all_tasks_view, name="render_all_tasks"),
    path('api/v1/tasks/assigned/<int:user_id>/', views.get_assigned_tasks, name='assigned_tasks'),
    # Auth-related endpoints
    path('auth/current-user/', views.get_current_user, name='current-user'),

    path('get-csrf/', ensure_csrf_cookie(TemplateView.as_view(template_name="blank.html"))),
]

# Add any app_name for namespacing
app_name = 'task_management'
