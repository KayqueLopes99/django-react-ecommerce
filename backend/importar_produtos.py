import requests
from django.core.files.base import ContentFile
from produtos.models import Categoria, Produto, Variacao

print("Iniciando a importação... Focando apenas em Perfumes, Maquiagem e Eletrônicos!")

# Usamos limit=0 para a API nos enviar o catálogo completo e a gente filtrar do nosso jeito
url_api = "https://dummyjson.com/products?limit=0"
resposta = requests.get(url_api)
dados = resposta.json()

# 1. O FILTRO: Lista das categorias exatas da API que queremos deixar passar
categorias_permitidas = [
    'fragrances',        # Perfumes
    'beauty',            # Maquiagem
    'skincare',          # Cuidados com a pele
    'smartphones',       # Eletrônicos
    'laptops',           # Eletrônicos
    'tablets',           # Eletrônicos
    'mobile-accessories' # Eletrônicos
]

# 2. TRADUTOR: Deixando os nomes bonitos e em português no seu banco
traducao = {
    'fragrances': 'Perfumes',
    'beauty': 'Maquiagem & Beleza',
    'skincare': 'Skincare',
    'smartphones': 'Smartphones',
    'laptops': 'Notebooks',
    'tablets': 'Tablets',
    'mobile-accessories': 'Acessórios Tech'
}

produtos_importados = 0
meta = 100 # Teto máximo de produtos para importar

for item in dados['products']:
    # SE A CATEGORIA NÃO FOR A QUE QUEREMOS, PULA PARA O PRÓXIMO!
    if item['category'] not in categorias_permitidas:
        continue
        
    # Se já batemos a meta de 50 produtos, ele encerra a fábrica
    if produtos_importados >= meta:
        break

    # Pega o nome traduzido da categoria
    nome_categoria_pt = traducao.get(item['category'], 'Diversos')
    categoria_obj, created = Categoria.objects.get_or_create(nome=nome_categoria_pt)

    # Baixando a imagem
    url_imagem = item['thumbnail']
    resposta_img = requests.get(url_imagem)
    nome_arquivo_img = f"prod_{item['id']}_mock.jpg"

    # Simulando valores em Real
    preco_base = float(item['price']) * 5
    desconto = float(item.get('discountPercentage', 0))
    preco_promo = preco_base - (preco_base * (desconto / 100)) if desconto > 0 else 0

    # Montando e salvando o Produto
    produto = Produto(
        categoria=categoria_obj,
        nome=item['title'][:255],
        descricao_curta=item['description'][:255],
        descricao_longa=item['description'],
        preco_marketing=preco_base,
        preco_marketing_promocional=preco_promo,
    )
    
    produto.imagem.save(nome_arquivo_img, ContentFile(resposta_img.content), save=True)

    # Variação
    Variacao.objects.create(
        produto=produto,
        nome="Padrão",
        preco=preco_base,
        preco_promocional=preco_promo,
        estoque=item.get('stock', 15)
    )
    
    produtos_importados += 1
    print(f"[{produtos_importados}/{meta}] Importado ({nome_categoria_pt}): {produto.nome}")

print("CIRURGIA FINALIZADA! Filtro aplicado e importação concluída com sucesso.")