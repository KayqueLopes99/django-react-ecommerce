import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle } from 'react-icons/fi';
import './ProdutoDetalhe.css';

const ProdutoDetalhe = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  

  // NOVO: Estado para a notificação elegante
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // ---------------- ADICIONE DAQUI PARA BAIXO ----------------
  const [qtdCarrinho, setQtdCarrinho] = useState(0);

  // Esse useEffect vigia o 'mensagemSucesso'. Quando você adiciona um item, 
  // a mensagem aparece e esse código roda instantaneamente, atualizando o ícone!
  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    setQtdCarrinho(totalItens);
  }, [mensagemSucesso]); 
  // -----------------------------------------------------------

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/produtos/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setProduto(data);
          
          if (data.variacoes && data.variacoes.length > 0) {
            setVariacaoSelecionada(data.variacoes[0]);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhes();
  }, [slug, navigate]);

  // NOVO: Reseta a quantidade para 1 toda vez que o usuário troca a cor/tamanho
  useEffect(() => {
    setQuantidade(1);
  }, [variacaoSelecionada]);

  // NOVO: Descobre qual é o estoque máximo permitido
  const estoqueDisponivel = variacaoSelecionada ? variacaoSelecionada.estoque : 0;

  // NOVO: Travas na quantidade
  const aumentarQtd = () => {
    if (quantidade < estoqueDisponivel) {
      setQuantidade(prev => prev + 1);
    }
  };
  
  const diminuirQtd = () => {
    setQuantidade(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdicionarAoCarrinho = () => {
    if (!variacaoSelecionada) return;

    let carrinhoAberto = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    const indexExistente = carrinhoAberto.findIndex(
      (item) => item.produto_id === produto.id && item.variacao_id === variacaoSelecionada.id
    );

    // Verificação dupla: O que ele quer adicionar + O que já tem no carrinho passa do estoque?
    const qtdJaNoCarrinho = indexExistente >= 0 ? carrinhoAberto[indexExistente].quantidade : 0;
    
    if (qtdJaNoCarrinho + quantidade > estoqueDisponivel) {
      // Se passar, a gente avisa e cancela a ação
      alert(`Você já tem ${qtdJaNoCarrinho} deste item no carrinho. O estoque máximo é ${estoqueDisponivel}.`);
      return;
    }

    const itemCarrinho = {
      produto_id: produto.id,
      variacao_id: variacaoSelecionada.id,
      nome: produto.nome,
      variacao_nome: variacaoSelecionada.nome,
      imagem: produto.imagem,
      preco_unitario: variacaoSelecionada.preco_promocional > 0 
                        ? variacaoSelecionada.preco_promocional 
                        : variacaoSelecionada.preco,
      quantidade: quantidade
    };

    if (indexExistente >= 0) {
      carrinhoAberto[indexExistente].quantidade += quantidade;
    } else {
      carrinhoAberto.push(itemCarrinho);
    }

    localStorage.setItem('meuCarrinho', JSON.stringify(carrinhoAberto));
    
    // NOVO: Chama o Toast de sucesso em vez do Alert feio
    setMensagemSucesso(`${quantidade}x ${produto.nome} adicionado!`);
    
    // Esconde o Toast automaticamente depois de 3 segundos
    setTimeout(() => {
      setMensagemSucesso('');
    }, 3000);
  };

  const formatarDinheiro = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (carregando) return <div className="loading-tela">Carregando detalhes...</div>;
  if (!produto) return null;

  const precoExibido = variacaoSelecionada ? variacaoSelecionada.preco : produto.preco_marketing;
  const precoPromoExibido = variacaoSelecionada ? variacaoSelecionada.preco_promocional : produto.preco_marketing_promocional;

  return (
    <div className="produto-detalhe-container">
      {/* NOVO: Componente do Toast Flutuante */}
      {mensagemSucesso && (
        <div className="toast-sucesso">
          <FiCheckCircle size={24} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      <header className="detalhe-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="btn-voltar">
          <FiArrowLeft size={20} /> Voltar para a Loja
        </Link>
        
        {/* NOVO: Ícone do carrinho adicionado no canto superior direito da tela de detalhes! */}
        <Link to="/carrinho" style={{ position: 'relative', color: 'var(--texto-escuro)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <FiShoppingCart size={26} />
          {qtdCarrinho > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-12px', backgroundColor: 'var(--cor-vermelho, #DC3545)', color: '#FFF', borderRadius: '50%', padding: '2px 7px', fontSize: '0.8rem', fontWeight: '800' }}>
              {qtdCarrinho}
            </span>
          )}
        </Link>
      </header>

      <main className="detalhe-main">
        <div className="detalhe-imagem-box">
          {produto.imagem ? (
            <img src={produto.imagem} alt={produto.nome} className="imagem-gigante" />
          ) : (
            <div className="imagem-gigante-placeholder">Sem Imagem</div>
          )}
        </div>

        <div className="detalhe-info-box">
          <span className="categoria-tag">{produto.categoria?.nome}</span>
          <h1 className="produto-titulo">{produto.nome}</h1>
          <p className="produto-desc-curta">{produto.descricao_curta}</p>

          <div className="produto-precos-grandes">
            {precoPromoExibido > 0 ? (
              <>
                <span className="preco-riscado">{formatarDinheiro(precoExibido)}</span>
                <span className="preco-destaque">{formatarDinheiro(precoPromoExibido)}</span>
              </>
            ) : (
              <span className="preco-destaque">{formatarDinheiro(precoExibido)}</span>
            )}
          </div>

          {produto.variacoes && produto.variacoes.length > 0 && (
            <div className="secao-variacoes">
              <h4>Escolha uma opção:</h4>
              <div className="botoes-variacao">
                {produto.variacoes.map((varItem) => (
                  <button 
                    key={varItem.id}
                    className={`btn-variacao ${variacaoSelecionada?.id === varItem.id ? 'ativo' : ''}`}
                    onClick={() => setVariacaoSelecionada(varItem)}
                  >
                    {varItem.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="area-compra-wrapper">
            {/* NOVO: Mostra o limite do estoque visualmente */}
            <span className="estoque-label">Estoque disponível: <strong>{estoqueDisponivel}</strong></span>
            
            <div className="area-compra">
              <div className="controle-quantidade">
                {/* Botões agora ficam desabilitados se passarem dos limites */}
                <button onClick={diminuirQtd} className="btn-qtd" disabled={quantidade <= 1}>
                  <FiMinus />
                </button>
                <span className="display-qtd">{quantidade}</span>
                <button onClick={aumentarQtd} className="btn-qtd" disabled={quantidade >= estoqueDisponivel}>
                  <FiPlus />
                </button>
              </div>

              {/* Se o estoque for zero, bloqueia o botão de compra também */}
              <button 
                className="btn-adicionar-carrinho" 
                onClick={handleAdicionarAoCarrinho}
                disabled={estoqueDisponivel === 0}
              >
                <FiShoppingCart size={20} /> 
                {estoqueDisponivel === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          </div>

          <div className="detalhe-descricao-longa">
            <h3>Sobre o Produto</h3>
            <p>{produto.descricao_longa}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProdutoDetalhe;