from rest_framework import serializers
from .models import Categoria, Produto, Variacao

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']

class VariacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variacao
        fields = ['id', 'nome', 'preco', 'preco_promocional', 'estoque']

class ProdutoSerializer(serializers.ModelSerializer):
    # Traz o objeto Categoria inteiro, e não apenas o ID
    categoria = CategoriaSerializer(read_only=True)
    # Traz todas as variações ligadas a este produto (usa o related_name padrão '_set')
    variacoes = VariacaoSerializer(source='variacao_set', many=True, read_only=True)
    
    # Pegando os métodos de formatação que você já criou no Model!
    preco_formatado = serializers.CharField(source='get_preco_formatado', read_only=True)
    preco_promo_formatado = serializers.CharField(source='get_preco_promocional_formatado', read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id', 'nome', 'slug', 'descricao_curta', 'descricao_longa', 
            'imagem', 'preco_marketing', 'preco_marketing_promocional', 
            'preco_formatado', 'preco_promo_formatado', 'tipo', 
            'categoria', 'variacoes'
        ]