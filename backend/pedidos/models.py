from django.db import models
from django.contrib.auth.models import User

class Pedido(models.Model):
    STATUS_CHOICES = [
        ('A', 'Aprovado'),
        ('C', 'Criado'),
        ('R', 'Reprovado'),
        ('P', 'Pendente'),
        ('E', 'Enviado'),
        ('F', 'Finalizado'),
        ('X', 'Cancelado'), 
    ]

    PAGAMENTO_CHOICES = [
        ('PIX', 'Pix'),
        ('CC', 'Cartão de Crédito'),
        ('BOL', 'Boleto Bancário'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total = models.FloatField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='C')
    metodo_pagamento = models.CharField(max_length=3, choices=PAGAMENTO_CHOICES, default='PIX') # NOVO CAMPO
    criado_em = models.DateTimeField(auto_now_add=True, null=True) # NOVO: Para sabermos a data da compra

    def __str__(self):
        return f'Pedido N.{self.pk} - {self.user.username}'
    
class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    produto = models.CharField(max_length=255)
    produto_id = models.PositiveIntegerField()
    variacao = models.CharField(max_length=255)
    variacao_id = models.PositiveIntegerField()
    
    preco = models.FloatField()
    preco_promocional = models.FloatField(default=0)
    
    quantidade = models.PositiveIntegerField()
    imagem = models.CharField(max_length=2000)

    def __str__(self):
        return f'Item {self.produto} (Pedido {self.pedido.id})'
    
    class Meta:
        verbose_name = 'Item do Pedido'
        verbose_name_plural = 'Itens do Pedido'