import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiArrowLeft, FiCheckCircle, FiClock, FiXCircle, FiUser } from 'react-icons/fi';
import './MeusPedidos.css';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const mostrarMensagem = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    // Busca os dados do usuário logado
    fetch('http://localhost:8000/api/meu-perfil/', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setPerfil(data))
      .catch(() => console.error('Erro ao buscar perfil.'));

    // Busca a lista de pedidos
    fetch('http://localhost:8000/api/pedidos/meus-pedidos/', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar pedidos');
        return res.json();
      })
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const cancelarPedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido? Os itens serão devolvidos ao estoque.')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/pedidos/meus-pedidos/${id}/cancelar/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Atualiza o status do pedido na tela sem precisar recarregar a página
        setPedidos(pedidos.map(p => p.id === id ? { ...p, status: 'X' } : p));
        mostrarMensagem('sucesso', 'Pedido cancelado com sucesso!');
      } else {
        const data = await response.json();
        mostrarMensagem('erro', data.erro || 'Erro ao cancelar o pedido.');
      }
    } catch (err) {
      mostrarMensagem('erro', 'Erro de conexão.');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'C': { texto: 'Criado', cor: 'status-criado', icone: <FiClock /> },
      'P': { texto: 'Pendente', cor: 'status-pendente', icone: <FiClock /> },
      'A': { texto: 'Aprovado', cor: 'status-aprovado', icone: <FiCheckCircle /> },
      'E': { texto: 'Enviado', cor: 'status-enviado', icone: <FiBox /> },
      'F': { texto: 'Finalizado', cor: 'status-finalizado', icone: <FiCheckCircle /> },
      'X': { texto: 'Cancelado', cor: 'status-cancelado', icone: <FiXCircle /> },
    };
    return statusMap[status] || { texto: 'Desconhecido', cor: 'status-cinza', icone: <FiBox /> };
  };

  if (loading) return <div className="loading-pedidos">Carregando seus pedidos...</div>;

  return (
    <div className="meus-pedidos-container">
      {feedback.text && <div className={`toast-message ${feedback.type}`}>{feedback.text}</div>}

      <header className="navbar-simples">
        <Link to="/" className="logo"><h2>Blasto<span>Store</span></h2></Link>
        <Link to="/" className="btn-voltar"><FiArrowLeft /> Voltar para a Loja</Link>
      </header>

      <main className="pedidos-main">
        <div className="cabecalho-usuario">
          <h1 className="titulo-pagina"><FiBox /> Meus Pedidos</h1>
          {perfil && (
            <div className="boas-vindas">
              <FiUser size={24} />
              <span>Olá, <strong>{perfil.username}</strong>!</span>
            </div>
          )}
        </div>

        {pedidos.length === 0 ? (
          <div className="pedidos-vazio">
            <h2>Você ainda não fez nenhum pedido!</h2>
            <Link to="/"><button className="btn-verde">Começar a comprar</button></Link>
          </div>
        ) : (
          <div className="lista-pedidos">
            {pedidos.map(pedido => {
              const infoStatus = getStatusInfo(pedido.status);
              // Pedido só pode ser cancelado se for "Criado", "Pendente" ou "Aprovado"
              const podeCancelar = ['C', 'P', 'A'].includes(pedido.status);

              return (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <h3>Pedido #{pedido.id}</h3>
                      <span className="data-pedido">
                        Realizado em: {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className={`status-badge ${infoStatus.cor}`}>
                      {infoStatus.icone} {infoStatus.texto}
                    </div>
                  </div>

                  <div className="pedido-itens">
                    {pedido.itens.map(item => (
                      <div key={item.id} className="item-resumo">
                        <img src={item.imagem} alt={item.produto} />
                        <div className="item-detalhes">
                          <p><strong>{item.produto}</strong></p>
                          <p className="item-variacao">Qtd: {item.quantidade} | Variação: {item.variacao}</p>
                        </div>
                        <div className="item-preco">
                          {((item.preco_promocional > 0 ? item.preco_promocional : item.preco) * item.quantidade)
                            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pedido-footer">
                    <div className="info-pagamento">
                      <span>Pagamento: <strong>{pedido.metodo_pagamento}</strong></span>
                      {podeCancelar && (
                        <button className="btn-cancelar" onClick={() => cancelarPedido(pedido.id)}>
                          <FiXCircle /> Cancelar Pedido
                        </button>
                      )}
                    </div>
                    <span className="total-pedido">
                      Total: <strong>{pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MeusPedidos;