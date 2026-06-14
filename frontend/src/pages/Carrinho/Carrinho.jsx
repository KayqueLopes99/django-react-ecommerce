import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Carrinho.css';
import logoImg from '../../assets/logo.png';

const Carrinho = () => {
  const navigate = useNavigate();
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [cep, setCep] = useState('');
  const [opcoesFrete, setOpcoesFrete] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  
  // Estado para mensagens (Feedback Visual)
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const mostrarMensagem = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('meuCarrinho');
    if (dadosSalvos) setItensCarrinho(JSON.parse(dadosSalvos));
  }, []);

  const alterarQuantidade = (index, nova) => {
    if (nova < 1) return;
    const novos = [...itensCarrinho];
    novos[index].quantidade = nova;
    setItensCarrinho(novos);
    localStorage.setItem('meuCarrinho', JSON.stringify(novos));
  };

  const removerItem = (index) => {
    const novos = itensCarrinho.filter((_, i) => i !== index);
    setItensCarrinho(novos);
    localStorage.setItem('meuCarrinho', JSON.stringify(novos));
  };

  const calcularSubtotal = () => itensCarrinho.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
  const calcularTotal = () => calcularSubtotal() + (freteSelecionado ? freteSelecionado.valor : 0);

  const calcularFrete = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return mostrarMensagem('erro', 'Digite um CEP válido com 8 dígitos.');

    try {
      const response = await fetch('http://localhost:8000/api/pedidos/calcular-frete/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cepLimpo })
      });
      const data = await response.json();
      if (response.ok) {
        setOpcoesFrete(data.opcoes);
        mostrarMensagem('sucesso', 'Frete calculado com sucesso!');
      } else {
        mostrarMensagem('erro', data.erro || 'Erro ao calcular frete.');
      }
    } catch { mostrarMensagem('erro', 'Erro de conexão com o servidor.'); }
  };

  const finalizarPedido = async () => {
    if(!freteSelecionado) return mostrarMensagem('erro', 'Selecione uma opção de frete!');
    
    // Simulação de chamada de API final
    mostrarMensagem('sucesso', 'Pedido enviado com sucesso! Redirecionando...');
    setTimeout(() => navigate('/meus-pedidos'), 2000);
  };

  return (
    <div className="carrinho-container">
      {/* Mensagem de Feedback */}
      {feedback.text && (
        <div className={`toast-message ${feedback.type}`}>
          {feedback.type === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
          {feedback.text}
        </div>
      )}

      <header className="navbar-simples">
        <Link to="/" className="logo">
          <img src={logoImg} alt="Logo" className="logo-img" />
          <h2>Blasto<span>Store</span></h2>
        </Link>
        <Link to="/" className="btn-voltar"><FiArrowLeft /> Continuar Comprando</Link>
      </header>

      <main className="carrinho-main">
        <h1 className="titulo-pagina"><FiShoppingCart /> Meu Carrinho</h1>

        {itensCarrinho.length === 0 ? (
          <div className="carrinho-vazio">
            <h2>Seu carrinho está vazio!</h2>
            <Link to="/"><button className="btn-verde">Ir para a Loja</button></Link>
          </div>
        ) : (
          <div className="carrinho-grid">
            <div className="lista-itens">
              {itensCarrinho.map((item, index) => (
                <div className="item-card" key={index}>
                  <img src={item.imagem} alt={item.nome} className="item-img" />
                  <div className="item-info">
                    <h3>{item.nome}</h3>
                    <p>Opção: {item.variacao_nome}</p>
                  </div>
                  <div className="qtd-box">
                    <button onClick={() => alterarQuantidade(index, item.quantidade - 1)}>-</button>
                    <span>{item.quantidade}</span>
                    <button onClick={() => alterarQuantidade(index, item.quantidade + 1)}>+</button>
                  </div>
                  <strong className="preco-item">{(item.preco_unitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <button className="btn-remover" onClick={() => removerItem(index)}><FiTrash2 /></button>
                </div>
              ))}
            </div>

            <div className="resumo-box">
              <h3>Resumo do Pedido</h3>
              <div className="linha-resumo"><span>Subtotal</span> <strong>{calcularSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
              
              <div className="frete-box">
                <input placeholder="CEP (ex: 59987000)" value={cep} onChange={(e) => setCep(e.target.value)} />
                <button onClick={calcularFrete}>Calcular</button>
              </div>

              {opcoesFrete.map((op, i) => (
                <div className={`frete-opcao ${freteSelecionado?.tipo === op.tipo ? 'ativo' : ''}`} onClick={() => setFreteSelecionado(op)} key={i}>
                  <span>{op.tipo} ({op.prazo})</span>
                  <strong>{op.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>
              ))}

              <div className="linha-total">
                <span>Total</span>
                <strong>{calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </div>

              <button className="btn-finalizar" onClick={finalizarPedido}>
                <FiCreditCard /> Finalizar Pedido
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default Carrinho;