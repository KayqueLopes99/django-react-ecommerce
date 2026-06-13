from django.urls import path
from . import views

urlpatterns = [
    path('finalizar/', views.finalizar_compra, name='finalizar_compra'),
    path('meus-pedidos/', views.meus_pedidos, name='meus_pedidos'),
    path('meus-pedidos/<int:pk>/', views.detalhe_pedido, name='detalhe_pedido'),
    path('meus-pedidos/<int:pk>/cancelar/', views.cancelar_pedido, name='cancelar_pedido'),
    
    path('calcular-frete/', views.calcular_frete, name='calcular_frete'),
    path('webhook/', views.webhook_pagamento, name='webhook_pagamento'),
]