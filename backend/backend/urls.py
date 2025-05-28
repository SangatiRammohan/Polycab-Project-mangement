

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.documentation import include_docs_urls
from rest_framework.permissions import IsAuthenticated

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/', include([
        # User management
        path('', include('users.urls')),
        
        # Include additional app URLs here as needed
        path('users/', include('users.urls')),
        path('tasks/', include('tasks.urls')),
    ])),
    
    # DRF authentication
    path('api-auth/', include('rest_framework.urls')),
    
    # API documentation
    # path('docs/', include_docs_urls(
    #     title='User Management API',
    #     permission_classes=[IsAuthenticated],
    #     description='API documentation for the User Management System'
    # )),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Add debug toolbar in development
    try:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass