from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PerfilUsuario
from rest_framework import serializers


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['idade', 'data_nascimento', 'cpf', 'endereco', 'numero', 'complemento', 'bairro', 'cep', 'cidade', 'estado']

class CadastroSerializer(serializers.ModelSerializer):
    perfil = PerfilUsuarioSerializer(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'perfil']

    def create(self, validated_data):
        perfil_data = validated_data.pop('perfil')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password) 
        user.save()
        
        PerfilUsuario.objects.create(user=user, **perfil_data)
        
        return user
    

class PerfilResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['idade', 'cpf', 'cidade', 'estado'] 

class UsuarioPerfilSerializer(serializers.ModelSerializer):
    perfil = PerfilResumoSerializer(source='perfilusuario', read_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'perfil']

class TrocarSenhaSerializer(serializers.Serializer):
    senha_antiga = serializers.CharField(required=True)
    senha_nova = serializers.CharField(required=True)