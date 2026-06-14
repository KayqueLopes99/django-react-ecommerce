from django.contrib import admin
from django.urls import path, include  
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('', include('perfil.urls')), 
    
    path('api/', include('produtos.urls')),
    
    path('api/', include('pedidos.urls')),
    
    path('api/pedidos/', include('pedidos.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)