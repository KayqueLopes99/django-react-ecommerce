from django.contrib import admin
#from .forms import VariacaoObrigatoria
from . import models

# 1. NOVA CLASSE PARA O ADMIN DE CATEGORIA
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug']
    # Faz o painel preencher o slug sozinho enquanto você digita o nome da categoria
    prepopulated_fields = {'slug': ('nome',)}

class VariacaoInline(admin.TabularInline):
    model = models.Variacao
    #formset = VariacaoObrigatoria
    min_num = 1
    extra = 0
    can_delete = True

class ProdutoAdmin(admin.ModelAdmin):
    # 2. ADICIONEI A 'categoria' AQUI NA LISTA DE EXIBIÇÃO
    list_display = ['nome', 'descricao_curta', 'categoria',
                    'get_preco_formatado', 'get_preco_promocional_formatado']
    prepopulated_fields = {'slug': ('nome',)}
    
    inlines = [
        VariacaoInline
    ]

# 3. REGISTRA A CATEGORIA PARA ELA APARECER NO PAINEL
admin.site.register(models.Categoria, CategoriaAdmin)

admin.site.register(models.Produto, ProdutoAdmin)
admin.site.register(models.Variacao)