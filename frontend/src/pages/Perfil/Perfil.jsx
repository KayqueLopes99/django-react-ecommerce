import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiMapPin, FiMail, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Perfil.css';

const Perfil = () => {
  const [perfilDados, setPerfilDados] = useState(null);
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });


  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/meu-perfil/', {
          method: 'GET',
        
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPerfilDados(data);
        } else {
          setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar os dados. Você está logado?' });
        }
      } catch (error) {
        setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
      }
    };

    buscarPerfil();
  }, []);

  const handleTrocarSenha = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await fetch('http://localhost:8000/api/trocar-senha/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') 
        },
        body: JSON.stringify({
          senha_antiga: senhaAntiga,
          senha_nova: senhaNova
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' });
        setSenhaAntiga('');
        setSenhaNova('');
      } else {
        setMensagem({ tipo: 'erro', texto: data.erro || 'Erro ao atualizar a senha. Verifique os dados.' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão com o servidor.' });
    }
  };

  return (
    <div className="perfil-container">
      
      <header className="perfil-header">
        <Link to="/" className="btn-voltar">
          <FiArrowLeft size={20} /> Voltar para a Loja
        </Link>
        <h2>Meu Painel</h2>
      </header>

      <div className="perfil-layout">
        
        <section className="perfil-card dados-card">
          <div className="card-cabecalho">
            <FiUser size={24} color="var(--cor-verde)" />
            <h3>Meus Dados</h3>
          </div>
          
          {perfilDados ? (
            <div className="dados-lista">
              <div className="dado-item">
                <FiUser className="dado-icone" />
                <div>
                  <span className="dado-label">Nome Completo</span>
                  <p className="dado-valor">{perfilDados.first_name} {perfilDados.last_name}</p>
                </div>
              </div>

              <div className="dado-item">
                <FiMail className="dado-icone" />
                <div>
                  <span className="dado-label">E-mail de Acesso</span>
                  <p className="dado-valor">{perfilDados.email}</p>
                </div>
              </div>

              <div className="dado-item">
                <FiLock className="dado-icone" />
                <div>
                  <span className="dado-label">CPF</span>
                  <p className="dado-valor">{perfilDados.perfil?.cpf || 'Não informado'}</p>
                </div>
              </div>

              <div className="dado-item">
                <FiMapPin className="dado-icone" />
                <div>
                  <span className="dado-label">Localização</span>
                  <p className="dado-valor">
                    {perfilDados.perfil?.cidade} - {perfilDados.perfil?.estado}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="loading-texto">Carregando informações...</p>
          )}
        </section>

        <section className="perfil-card senha-card">
          <div className="card-cabecalho">
            <FiLock size={24} color="var(--cor-vermelho)" />
            <h3>Segurança</h3>
          </div>

          {mensagem.texto && (
            <div className={`mensagem-alerta ${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleTrocarSenha} className="senha-form">
            <div className="input-group-perfil">
              <label>Senha Atual</label>
              <input 
                type="password" 
                placeholder="Digite sua senha antiga" 
                value={senhaAntiga}
                onChange={(e) => setSenhaAntiga(e.target.value)}
                required
              />
            </div>

            <div className="input-group-perfil">
              <label>Nova Senha</label>
              <input 
                type="password" 
                placeholder="Crie uma nova senha forte" 
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-salvar-senha">
              Atualizar Senha
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default Perfil;