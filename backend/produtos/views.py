from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer

class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    lookup_field = 'slug'

class ProdutoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Produto.objects.all().order_by('-id')
    serializer_class = ProdutoSerializer
    
    lookup_field = 'slug' 

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    filterset_fields = ['categoria__slug'] 
    
    search_fields = ['nome', 'descricao_curta', 'descricao_longa']

    @action(detail=False, methods=['get'])
    def ofertas(self, request):
        produtos_em_oferta = self.queryset.filter(preco_marketing_promocional__gt=0)
        
        page = self.paginate_queryset(produtos_em_oferta)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(produtos_em_oferta, many=True)
        return Response(serializer.data)