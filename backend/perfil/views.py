from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from .serializers import CadastroSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from .serializers import UsuarioPerfilSerializer, TrocarSenhaSerializer

class CadastroView(APIView):
    def post(self, request):
        serializer = CadastroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensagem": "Usuário e perfil cadastrados com sucesso!"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        # O React está enviando o e-mail dentro da variável 'username'
        email_digitado = request.data.get('username')
        password = request.data.get('password')
        
        # 1. O TRUQUE: Tentamos achar o usuário no banco pelo e-mail
        try:
            user_obj = User.objects.get(email=email_digitado)
            username_real = user_obj.username # Achamos o username verdadeiro!
        except User.DoesNotExist:
            username_real = None # Se não achar o e-mail, a autenticação vai falhar abaixo
        
        # 2. Agora usamos o username_real para o Django validar a senha criptografada
        user = authenticate(request, username=username_real, password=password)
        
        if user is not None:
            login(request, user) # Cria a sessão
            return Response(
                {"mensagem": "Login realizado com sucesso!", "username": user.username}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"erro": "Usuário ou senha incorretos."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutView(APIView):
    def post(self, request):
        logout(request) 
        return Response(
            {"mensagem": "Logout realizado com sucesso!"}, 
            status=status.HTTP_200_OK
        )
        


# 1. View para ler os dados do usuário logado
class DadosPerfilView(APIView):
    permission_classes = [IsAuthenticated] # O Segurança: Só passa se tiver logado

    def get(self, request):
        # O 'request.user' já sabe quem é o usuário graças ao token/sessão do login
        serializer = UsuarioPerfilSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# 2. View para trocar a senha
class TrocarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = TrocarSenhaSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            senha_antiga = serializer.validated_data['senha_antiga']
            senha_nova = serializer.validated_data['senha_nova']

            # Verifica se a senha antiga que ele digitou confere com a do banco
            if not user.check_password(senha_antiga):
                return Response(
                    {"erro": "A senha antiga está incorreta."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Se passou, criptografa a nova senha e salva!
            user.set_password(senha_nova)
            user.save()
            
            return Response({"mensagem": "Senha atualizada com sucesso!"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)