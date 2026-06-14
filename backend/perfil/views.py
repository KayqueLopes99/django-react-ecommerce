from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from .serializers import CadastroSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from .serializers import UsuarioPerfilSerializer, TrocarSenhaSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class CadastroView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = CadastroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensagem": "Usuário e perfil cadastrados com sucesso!"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        email_digitado = request.data.get('username')
        password = request.data.get('password')
        
        try:
            user_obj = User.objects.get(email=email_digitado)
            username_real = user_obj.username 
        except User.DoesNotExist:
            username_real = None 
        
        user = authenticate(request, username=username_real, password=password)
        
        if user is not None:
            login(request, user) 
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
        


class DadosPerfilView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        serializer = UsuarioPerfilSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TrocarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = TrocarSenhaSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            senha_antiga = serializer.validated_data['senha_antiga']
            senha_nova = serializer.validated_data['senha_nova']

            if not user.check_password(senha_antiga):
                return Response(
                    {"erro": "A senha antiga está incorreta."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(senha_nova)
            user.save()
            
            return Response({"mensagem": "Senha atualizada com sucesso!"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)