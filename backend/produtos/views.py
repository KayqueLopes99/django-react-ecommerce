from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer

class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """ Exibe a lista de categorias para o React montar o Menu Lateral """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    lookup_field = 'slug'

class ProdutoViewSet(viewsets.ReadOnlyModelViewSet):
    """ O Motor principal do seu E-commerce """
    queryset = Produto.objects.all().order_by('-id')
    serializer_class = ProdutoSerializer
    
    # Para a URL de detalhes ser /produtos/nome-do-produto/ em vez do ID (Ótimo para SEO)
    lookup_field = 'slug' 

    # Habilitando Busca de Texto e Filtro de Categoria
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    # Filtro exato: ?categoria__slug=eletronicos
    filterset_fields = ['categoria__slug'] 
    
    # Busca de texto: ?search=teclado
    search_fields = ['nome', 'descricao_curta', 'descricao_longa']

    # Criando uma Rota Exclusiva para Produtos em Oferta (/api/produtos/ofertas/)
    @action(detail=False, methods=['get'])
    def ofertas(self, request):
        # Filtra apenas produtos onde o preço promocional é maior que zero
        produtos_em_oferta = self.queryset.filter(preco_marketing_promocional__gt=0)
        
        # Paginação opcional, caso você tenha muitos produtos em oferta
        page = self.paginate_queryset(produtos_em_oferta)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(produtos_em_oferta, many=True)
        return Response(serializer.data)