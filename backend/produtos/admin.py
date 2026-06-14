from django.contrib import admin
from . import models

class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug']
    prepopulated_fields = {'slug': ('nome',)}

class VariacaoInline(admin.TabularInline):
    model = models.Variacao
    min_num = 1
    extra = 0
    can_delete = True

class ProdutoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'descricao_curta', 'categoria',
                    'get_preco_formatado', 'get_preco_promocional_formatado']
    prepopulated_fields = {'slug': ('nome',)}
    
    inlines = [
        VariacaoInline
    ]

admin.site.register(models.Categoria, CategoriaAdmin)

admin.site.register(models.Produto, ProdutoAdmin)
admin.site.register(models.Variacao)