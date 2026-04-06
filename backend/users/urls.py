from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserViewSet

# Single router — no duplicates
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    # Auth endpoints
    path('auth/login/',    views.UserLoginView.as_view(),    name='login'),
    path('auth/logout/',   views.UserLogoutView.as_view(),   name='logout'),
    path('auth/password-change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('auth/password-reset/',  views.PasswordResetView.as_view(),  name='password_reset'),
    path('auth/password-reset-confirm/<uidb64>/<token>/',
         views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Current user
    path('users/me/', views.CurrentUserView.as_view(), name='current_user'),

    # Bulk operations
    path('users/bulk-create/', views.UserViewSet.as_view({'post': 'bulk_create'}),  name='user-bulk-create'),
    path('users/bulk-update/', views.UserViewSet.as_view({'patch': 'bulk_update'}), name='user-bulk-update'),
    path('users/bulk-delete/', views.UserViewSet.as_view({'post': 'bulk_delete'}),  name='user-bulk-delete'),
]

# Add router URLs (gives us /users/, /users/<id>/ etc.)
urlpatterns += router.urls