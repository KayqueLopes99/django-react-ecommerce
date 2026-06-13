from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Pedido, ItemPedido
from .serializers import PedidoSerializer
from produtos.models import Variacao

# 1. FINALIZAÇÃO DO PEDIDO (CHECKOUT)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def finalizar_compra(request):
    dados = request.data
    carrinho = dados.get('carrinho', [])
    total_pedido = dados.get('total', 0.0)
    metodo_pag = dados.get('metodo_pagamento', 'PIX')

    if not carrinho:
        return Response({"erro": "O carrinho está vazio."}, status=status.HTTP_400_BAD_REQUEST)

    # Cria o Pedido com o método de pagamento
    pedido = Pedido.objects.create(
        user=request.user,
        total=total_pedido,
        status='C',
        metodo_pagamento=metodo_pag
    )

    for item in carrinho:
        try:
            variacao_banco = Variacao.objects.select_for_update().get(id=item['variacao_id'])
            
            if variacao_banco.estoque < item['quantidade']:
                raise ValueError(f"Estoque insuficiente para {item['nome']}.")

            ItemPedido.objects.create(
                pedido=pedido,
                produto=item['nome'],
                produto_id=item['produto_id'],
                variacao=item['variacao_nome'],
                variacao_id=item['variacao_id'],
                preco=item['preco_unitario'],
                preco_promocional=0,
                quantidade=item['quantidade'],
                imagem=item.get('imagem', '')
            )

            # Abate o estoque
            variacao_banco.estoque -= item['quantidade']
            variacao_banco.save()

        except Variacao.DoesNotExist:
            return Response({"erro": f"Variação {item['variacao_id']} não existe."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"mensagem": "Pedido realizado!", "pedido_id": pedido.id}, status=status.HTTP_201_CREATED)

# 2. LISTAR PEDIDOS DO USUÁRIO E VISUALIZAR STATUS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meus_pedidos(request):
    # Traz todos os pedidos do usuário logado, do mais recente para o mais antigo
    pedidos = Pedido.objects.filter(user=request.user).order_by('-id')
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)

# 3. RESUMO/DETALHE DE UM PEDIDO ESPECÍFICO
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhe_pedido(request, pk):
    try:
        pedido = Pedido.objects.get(pk=pk, user=request.user)
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)
    except Pedido.DoesNotExist:
        return Response({"erro": "Pedido não encontrado."}, status=status.HTTP_404_NOT_FOUND)

# 4. CANCELAR PEDIDO E DEVOLVER AO ESTOQUE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def cancelar_pedido(request, pk):
    try:
        pedido = Pedido.objects.get(pk=pk, user=request.user)
        
        # Só deixa cancelar se ainda não foi enviado ou finalizado
        if pedido.status in ['E', 'F', 'X']:
            return Response({"erro": "Este pedido não pode mais ser cancelado."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Muda o status para Cancelado
        pedido.status = 'X'
        pedido.save()

        # DEVOLVER AO ESTOQUE!
        itens = ItemPedido.objects.filter(pedido=pedido)
        for item in itens:
            try:
                variacao_banco = Variacao.objects.get(id=item.variacao_id)
                variacao_banco.estoque += item.quantidade
                variacao_banco.save()
            except Variacao.DoesNotExist:
                pass # Se a variação foi apagada do banco no meio tempo, ignora

        return Response({"mensagem": "Pedido cancelado e itens devolvidos ao estoque."})
        
    except Pedido.DoesNotExist:
        return Response({"erro": "Pedido não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
# Adicione esta importação lá no topo junto com IsAuthenticated
from rest_framework.permissions import IsAuthenticated, AllowAny

# ==========================================
# 5. CÁLCULO DE FRETE (SIMULADO)
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny]) # O usuário pode calcular o frete antes mesmo de logar!
def calcular_frete(request):
    cep = request.data.get('cep', '')
    
    # Limpa o CEP tirando o traço
    cep_limpo = str(cep).replace('-', '')

    if len(cep_limpo) != 8:
        return Response({"erro": "CEP inválido. Digite os 8 números."}, status=status.HTTP_400_BAD_REQUEST)

    # SIMULAÇÃO INTELIGENTE: Gera um valor diferente baseado na região do CEP
    fator_distancia = int(cep_limpo[:2]) / 2.5
    
    valor_pac = round(18.50 + fator_distancia, 2)
    valor_sedex = round(35.90 + (fator_distancia * 1.8), 2)

    opcoes_frete = [
        {"tipo": "PAC", "prazo": "7 a 10 dias úteis", "valor": valor_pac},
        {"tipo": "SEDEX", "prazo": "2 a 4 dias úteis", "valor": valor_sedex}
    ]

    return Response({
        "cep_destino": cep,
        "opcoes": opcoes_frete
    }, status=status.HTTP_200_OK)

# ==========================================
# 6. WEBHOOK DE PAGAMENTO (Ex: Mercado Pago)
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny]) # Tem que ser livre, pois o request vem do servidor do gateway de pagamento
def webhook_pagamento(request):
    # O formato dos dados depende de qual gateway você vai usar no futuro.
    # Esta é uma simulação de payload padrão.
    dados = request.data
    
    pedido_id = dados.get('pedido_id')
    status_pagamento = dados.get('status') # Ex: 'approved', 'rejected'

    if not pedido_id or not status_pagamento:
        return Response({"erro": "Payload inválido."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pedido = Pedido.objects.get(id=pedido_id)

        # Atualiza o status do nosso banco com base no aviso do banco central
        if status_pagamento == 'approved':
            pedido.status = 'A' # Aprovado
            # Aqui você poderia disparar um email: "Seu pagamento foi confirmado!"
        elif status_pagamento == 'rejected':
            pedido.status = 'R' # Reprovado
            # Aqui você poderia liberar o estoque de volta, igual fizemos no Cancelar
            
        pedido.save()
        return Response({"mensagem": "Status do pedido atualizado via Webhook!"}, status=status.HTTP_200_OK)

    except Pedido.DoesNotExist:
        return Response({"erro": "Pedido não encontrado no banco de dados."}, status=status.HTTP_404_NOT_FOUND)