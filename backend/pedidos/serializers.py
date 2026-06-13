from rest_framework import serializers
from .models import Pedido, ItemPedido

class ItemPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = '__all__'

class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(source='itempedido_set', many=True, read_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'user', 'total', 'status', 'metodo_pagamento', 'criado_em', 'itens']