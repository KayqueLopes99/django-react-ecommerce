from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PerfilUsuario
from rest_framework import serializers


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
    

# 1. Serializer para o Perfil (Trazendo só o necessário para a tela)
class PerfilResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['idade', 'cpf', 'cidade', 'estado'] # Não precisa mandar endereço completo agora

class UsuarioPerfilSerializer(serializers.ModelSerializer):
    # Conecta o perfil ao usuário. O 'source' usa o related_name padrão do OneToOneField
    perfil = PerfilResumoSerializer(source='perfilusuario', read_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'perfil']

# 2. Serializer exclusivo para Troca de Senha
class TrocarSenhaSerializer(serializers.Serializer):
    senha_antiga = serializers.CharField(required=True)
    senha_nova = serializers.CharField(required=True)