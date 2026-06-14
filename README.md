# Django-React E-commerce (BlastoStore)

Um sistema completo de E-commerce construído com **Django Rest Framework** no back-end e **React.js** no front-end. O projeto inclui gestão de produtos, controle de estoque por variações, carrinho de compras, cálculo de frete simulado e um fluxo de checkout completo com painel de usuário.

---

## Funcionalidades Principais

### Front-end (React)
- **Catálogo de Produtos:** Listagem dinâmica com preços, imagens e categorias.
- **Detalhes do Produto:** Seleção de variações (cor/tamanho) com verificação de estoque em tempo real.
- **Carrinho:** Salvo no `localStorage`, com cálculos automáticos de subtotal considerando promoções ativas.
- **Checkout Integrado:** Conferência de dados do cliente (CPF, Endereço fragmentado) e seleção de método de pagamento (Pix, Cartão, Boleto) na mesma tela.
- **Meus Pedidos:** Painel do cliente para acompanhar o status da compra e opção de cancelar pedidos (devolvendo os itens automaticamente ao estoque).
- **Notificações:** Sistema de Feedback (Toasts) limpo e amigável, sem uso de `alerts` nativos.

### Back-end (Django)
- **API RESTful:** Construída com Django REST Framework.
- **Gestão de Estoque:** Controle rígido no momento da compra utilizando `select_for_update()` para evitar transações simultâneas (concorrência).
- **Autenticação:** Sistema de Sessões (`SessionAuthentication`) com configuração customizada de CSRF para o React.
- **Simulação de Frete:** Endpoint que calcula valores e prazos fictícios baseados na região do CEP digitado.
- **Cancelamento Seguro:** Endpoint de cancelamento de pedidos com regra de negócio que estorna a quantidade exata da variação de volta ao banco de dados.

---

## Tecnologias Utilizadas

**Back-end:**
- Python 
- Django 
- PostgreSQL

**Front-end:**
- React.js 
- React Router DOM 
- React Icons 
- CSS3 puro 

---

## Como rodar o projeto localmente

### 1. Configurando o Back-end (Django)

Abra o terminal na pasta raiz do back-end (`/backend`) e execute os passos abaixo:

```bash
# 1. Crie e ative o ambiente virtual (Windows)
python -m venv venv
venv\Scripts\activate

# 2. Instale as dependências (caso possua um requirements.txt)
pip install django djangorestframework django-cors-headers

# 3. Crie e aplique as migrações no banco de dados
python manage.py makemigrations
python manage.py migrate

# 4. Crie um superusuário para acessar o painel Admin (/admin)
python manage.py createsuperuser

# 5. Rode o servidor
python manage.py runserver