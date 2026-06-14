import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiCreditCard, FiCheckCircle, FiAlertCircle, FiMapPin, FiUser } from 'react-icons/fi';
import './Carrinho.css';
import logoImg from '../../assets/logo.png';

const Carrinho = () => {
    const navigate = useNavigate();
    const [itensCarrinho, setItensCarrinho] = useState([]);
    const [isCheckout, setIsCheckout] = useState(false);

    const [cep, setCep] = useState('');
    const [opcoesFrete, setOpcoesFrete] = useState([]);
    const [freteSelecionado, setFreteSelecionado] = useState(null);

    const [perfil, setPerfil] = useState(null);
    const [pagamento, setPagamento] = useState('PIX');
    const [feedback, setFeedback] = useState({ type: '', text: '' });

    const mostrarMensagem = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
    };

    useEffect(() => {
        const dadosSalvos = localStorage.getItem('meuCarrinho');
        if (dadosSalvos) setItensCarrinho(JSON.parse(dadosSalvos));
    }, []);

    useEffect(() => {
        if (isCheckout && !perfil) {
            fetch('http://localhost:8000/api/meu-perfil/', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => setPerfil(data))
                .catch(() => mostrarMensagem('erro', 'Erro ao carregar dados do perfil.'));
        }
    }, [isCheckout, perfil]);

    const alterarQuantidade = (index, nova) => {
        const novos = [...itensCarrinho];
        novos[index].quantidade = Math.max(1, nova);
        setItensCarrinho(novos);
        localStorage.setItem('meuCarrinho', JSON.stringify(novos));
    };

    const removerItem = (index) => {
        const novos = itensCarrinho.filter((_, i) => i !== index);
        setItensCarrinho(novos);
        localStorage.setItem('meuCarrinho', JSON.stringify(novos));
    };

    const calcularSubtotal = () => itensCarrinho.reduce((acc, item) => {
        const precoReal = item.preco_promocional > 0 ? item.preco_promocional : item.preco_unitario;
        return acc + (precoReal * item.quantidade);
    }, 0);
    
    const calcularTotal = () => calcularSubtotal() + (freteSelecionado ? freteSelecionado.valor : 0);

    const calcularFrete = async () => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return mostrarMensagem('erro', 'CEP inválido.');
        try {
            const response = await fetch('http://localhost:8000/api/pedidos/calcular-frete/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cep: cepLimpo })
            });
            const data = await response.json();
            if (response.ok) setOpcoesFrete(data.opcoes);
            else mostrarMensagem('erro', 'Erro ao calcular frete.');
        } catch { mostrarMensagem('erro', 'Erro de conexão.'); }
    };

    const finalizarPedido = async () => {
        const payload = {
            carrinho: itensCarrinho,
            total: calcularTotal(), 
            metodo_pagamento: pagamento
        };

        try {
            const response = await fetch('http://localhost:8000/api/pedidos/finalizar/', {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.removeItem('meuCarrinho');
                mostrarMensagem('sucesso', 'Pedido realizado com sucesso!');
                setTimeout(() => navigate('/meus-pedidos'), 2000);
            } else {
                mostrarMensagem('erro', data.erro || 'Erro ao processar pedido.');
            }
        } catch (err) {
            mostrarMensagem('erro', 'Erro de conexão.');
        }
    };

    return (
        <div className="carrinho-container">
            {feedback.text && <div className={`toast-message ${feedback.type}`}>{feedback.text}</div>}

            <header className="navbar-simples">
                <Link to="/" className="logo"><h2>Blasto<span>Store</span></h2></Link>
                <button className="btn-voltar" onClick={() => isCheckout ? setIsCheckout(false) : navigate('/')}>
                    <FiArrowLeft /> {isCheckout ? 'Voltar para o Carrinho' : 'Continuar Comprando'}
                </button>
            </header>

            <main className="carrinho-main">
                <h1 className="titulo-pagina">{isCheckout ? 'Checkout Final' : 'Meu Carrinho'}</h1>

                {!isCheckout ? (
                    itensCarrinho.length === 0 ? (
                        <div className="carrinho-vazio"><h2>Carrinho vazio!</h2><Link to="/"><button className="btn-verde">Ir para a Loja</button></Link></div>
                    ) : (
                        <div className="carrinho-grid">
                            <div className="lista-itens">
                                {itensCarrinho.map((item, index) => {
                                    const precoExibido = item.preco_promocional > 0 ? item.preco_promocional : item.preco_unitario;

                                    return (
                                        <div className="item-card" key={index}>
                                            <img src={item.imagem} alt={item.nome} className="item-img" />
                                            <div className="item-info"><h3>{item.nome}</h3><p>{item.variacao_nome}</p></div>
                                            <div className="qtd-box"><button onClick={() => alterarQuantidade(index, item.quantidade - 1)}>-</button><span>{item.quantidade}</span><button onClick={() => alterarQuantidade(index, item.quantidade + 1)}>+</button></div>
                                            <strong>{(precoExibido * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                                            <button className="btn-remover" onClick={() => removerItem(index)}><FiTrash2 /></button>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="resumo-box">
                                <h3>Resumo</h3>
                                <div className="frete-box"><input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} /><button onClick={calcularFrete}>Calcular</button></div>
                                {opcoesFrete.map((op, i) => (<div className={`frete-opcao ${freteSelecionado?.tipo === op.tipo ? 'ativo' : ''}`} onClick={() => setFreteSelecionado(op)} key={i}><span>{op.tipo}</span><strong>{op.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>))}
                                <div className="linha-total"><span>Total</span><strong>{calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <button className="btn-finalizar" disabled={!freteSelecionado} onClick={() => setIsCheckout(true)}>Continuar para Checkout</button>
                            </div>
                        </div>
                    )
                ) : (
                    perfil ? (
                        <div className="checkout-view-grid">
                            <div className="painel-dados">
                                
                                <h3 style={{ marginBottom: '10px' }}><FiUser /> Dados do Cliente</h3>
                                <div className="endereco-fragmentado" style={{ marginBottom: '25px' }}>
                                    <p><span>Nome de Usuário:</span> {perfil.username}</p>
                                    <p><span>CPF:</span> {perfil.perfil?.cpf || 'Não informado'}</p>
                                    
                                </div>
                                

                                <h3><FiMapPin /> Endereço de Entrega</h3>
                                <div className="endereco-fragmentado">
                                    <p><span>Rua:</span> {perfil.perfil?.endereco || 'Não informado'}</p>
                                    <p><span>Número:</span> {perfil.perfil?.numero || 'S/N'}</p>
                                    <p><span>Bairro:</span> {perfil.perfil?.bairro || 'Não informado'}</p>
                                    <p><span>Cidade:</span> {perfil.perfil?.cidade || 'Não informado'}</p>
                                    <p><span>Estado:</span> {perfil.perfil?.estado || 'Não informado'}</p>
                                    <p><span>CEP:</span> {perfil.perfil?.cep || 'Não informado'}</p>
                                </div>
                            </div>

                            <div className="resumo-box">
                                <h3><FiCreditCard /> Pagamento</h3>
                                <div className="linha-resumo"><span>Subtotal</span> <strong>{calcularSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div className="linha-resumo"><span>Frete</span> <strong>{freteSelecionado?.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                                <div className="linha-total"><span>Total Final</span> <strong>{calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>

                                <select onChange={(e) => setPagamento(e.target.value)} value={pagamento} style={{ width: '100%', padding: '10px', marginTop: '15px', borderRadius: '6px' }}>
                                    <option value="PIX">Pix</option>
                                    <option value="CC">Cartão de Crédito</option>
                                    <option value="BOL">Boleto</option>
                                </select>
                                <button className="btn-finalizar" onClick={finalizarPedido}>Confirmar Pedido</button>
                            </div>
                        </div>
                    ) : <p className="loading-state">Carregando dados do cliente...</p>
                )}
            </main>
        </div>
    );
};
export default Carrinho;