from django.urls import path,include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

app_name = 'user_management'
# Create a router for viewsets
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')


user_list = UserViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

bulk_create = UserViewSet.as_view({
    'post': 'bulk_create'
})
bulk_update = UserViewSet.as_view({
    'patch': 'bulk_update'
})
bluk_delete = UserViewSet.as_view({
    'delete': 'bulk_delete'
})

# Individual URL patterns
urlpatterns = [

    path('api/v1/', include(router.urls)),
    # User authentication endpoints
    path('auth/login/', views.UserLoginView.as_view(), name='login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='logout'),
    path('auth/password-change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('auth/password-reset/', views.PasswordResetView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Current user profile endpoint
    path('users/me/', views.CurrentUserView.as_view(), name='current_user'),
    
    # Bulk operations
 path('api/v1/users/', user_list, name='user-list'),
    path('bulk-create/', bulk_create, name='user-bulk-create'),
    path('bulk-update/', bulk_update, name='user_bulk_update'),
    path('bulk-delete/', bluk_delete, name='user_bulk_delete'),
]

# Combine router URLs with individual URL patterns
urlpatterns += router.urls
