from django.urls import path
from . import views

urlpatterns = [
    path('api/cadastro/', views.CadastroView.as_view(), name='api_cadastro'),
    path('api/login/', views.LoginView.as_view(), name='api_login'),
    path('api/logout/', views.LogoutView.as_view(), name='api_logout'),
]