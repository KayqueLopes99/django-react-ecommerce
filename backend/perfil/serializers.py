from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PerfilUsuario

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        # O user não entra aqui pois será vinculado automaticamente
        fields = ['idade', 'data_nascimento', 'cpf', 'endereco', 'numero', 'complemento', 'bairro', 'cep', 'cidade', 'estado']

class CadastroSerializer(serializers.ModelSerializer):
    perfil = PerfilUsuarioSerializer(required=True)
    # write_only=True garante que a senha nunca seja devolvida na resposta da API
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'perfil']

    def create(self, validated_data):
        # 1. Tira os dados do perfil e a senha do dicionário principal
        perfil_data = validated_data.pop('perfil')
        password = validated_data.pop('password')
        
        # 2. Cria o usuário base do Django
        user = User(**validated_data)
        user.set_password(password) # CRUCIAL: Isso criptografa a senha!
        user.save()
        
        # 3. Cria o PerfilUsuario vinculando ao usuário base criado acima
        PerfilUsuario.objects.create(user=user, **perfil_data)
        
        return user