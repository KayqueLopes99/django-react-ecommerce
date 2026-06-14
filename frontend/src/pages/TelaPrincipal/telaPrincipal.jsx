import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiImage, FiUser, FiLogOut, FiSearch, FiBox} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import './TelaPrincipal.css';
import logoImg from '../../assets/logo.png';

const TelaPrincipal = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem('nomeUsuario') || "Visitante";

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [termoBusca, setTermoBusca] = useState('');
  const [tituloSecao, setTituloSecao] = useState('Destaques da Semana');

  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [qtdCarrinho, setQtdCarrinho] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/categorias/')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error("Erro ao buscar categorias:", err));
  }, []);

  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    setQtdCarrinho(totalItens);
  }, []); 
  const buscarDados = async (url, titulo) => {
    setCarregando(true);
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProdutos(data.results ? data.results : data);
        setTituloSecao(titulo);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados('http://localhost:8000/api/produtos/', 'Destaques da Semana');
  }, []);

  const handlePesquisa = (e) => {
    e.preventDefault();
    setMostrarSugestoes(false); 
    setCategoriaAtiva(''); 

    if (termoBusca.trim() === '') {
      buscarDados('http://localhost:8000/api/produtos/', 'Destaques da Semana');
    } else {
      buscarDados(`http://localhost:8000/api/produtos/?search=${termoBusca}`, `Resultados para "${termoBusca}"`);
    }
  };

  const handleMudancaBusca = async (e) => {
    const valor = e.target.value;
    setTermoBusca(valor);

    if (valor.trim() === '') {
      setSugestoes([]);
      setMostrarSugestoes(false);
      setCategoriaAtiva('');
      buscarDados('http://localhost:8000/api/produtos/', 'Destaques da Semana');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/produtos/?search=${valor}`);
      if (response.ok) {
        const data = await response.json();
        const resultados = data.results ? data.results : data;
        setSugestoes(resultados.slice(0, 5)); 
        setMostrarSugestoes(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClicarSugestao = (produto) => {
    setTermoBusca(produto.nome);
    setMostrarSugestoes(false);
    setCategoriaAtiva('');
    buscarDados(`http://localhost:8000/api/produtos/?search=${produto.nome}`, `Resultados para "${produto.nome}"`);
  };

  const handleFiltrarCategoria = (slug, nome) => {
    setCategoriaAtiva(slug);
    setTermoBusca(''); 
    if (!slug) {
      buscarDados('http://localhost:8000/api/produtos/', 'Destaques da Semana');
    } else {
      buscarDados(`http://localhost:8000/api/produtos/?categoria__slug=${slug}`, `Categoria: ${nome}`);
    }
  };

  const handleVerOfertas = (e) => {
    e.preventDefault();
    setCategoriaAtiva('');
    buscarDados('http://localhost:8000/api/produtos/ofertas/', 'Super Ofertas');
  };

  const handleLogout = () => {
    localStorage.removeItem('nomeUsuario');
    navigate('/login');
  };

  return (
    <div className="tela-principal">
      <header className="navbar">
        <div className="logo">
          <img src={logoImg} alt="Logo Kayque Store" className="logo-img" />
          <h2>Blasto<span>Store</span></h2>
        </div>

        <div className="busca-container" onMouseLeave={() => setMostrarSugestoes(false)}>
          <form onSubmit={handlePesquisa} className="busca-form">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={termoBusca}
              onChange={handleMudancaBusca}
              onFocus={() => termoBusca.trim() !== '' && setMostrarSugestoes(true)}
              className="busca-input"
            />
            <button type="submit" className="busca-btn">
              <FiSearch size={18} />
            </button>
          </form>

          {mostrarSugestoes && sugestoes.length > 0 && (
            <ul className="sugestoes-dropdown">
              {sugestoes.map((sugestao) => (
                <li key={sugestao.id} onClick={() => handleClicarSugestao(sugestao)}>
                  {sugestao.imagem ? (
                    <img src={sugestao.imagem} alt={sugestao.nome} className="sugestao-img" />
                  ) : (
                    <div className="sugestao-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiImage color="#CCC" />
                    </div>
                  )}
                  <div className="sugestao-info">
                    <h4>{sugestao.nome.length > 35 ? `${sugestao.nome.substring(0, 35)}...` : sugestao.nome}</h4>
                    <span>{sugestao.preco_promo_formatado || sugestao.preco_formatado}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="menu">
          <a href="#" onClick={(e) => { e.preventDefault(); handleFiltrarCategoria('', ''); }}>Início</a>
        </nav>

        <Link to="/meus-pedidos" className="menu-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#333', textDecoration: 'none', fontWeight: 'bold' }}>
          <FiBox size={20} />
          Meus Pedidos
        </Link>

        <div className="acoes-usuario">
          <span className="saudacao">Olá <strong>{nomeUsuario}</strong>!</span>
          <Link to="/perfil" className="btn-perfil" title="Meu Perfil">
            <FiUser size={20} />
          </Link>
          <button onClick={handleLogout} className="btn-logout" title="Sair da Conta">
            <FiLogOut size={20} />
          </button>
          <Link to="/carrinho" className="carrinho-btn" style={{ textDecoration: 'none' }}>
            <FiShoppingCart size={20} />
            {qtdCarrinho > 0 && <span className="badge-contador">{qtdCarrinho}</span>}
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="tag-lancamento">Nova Coleção 2026</span>
          <h1>Tecnologia e Estilo em um só lugar.</h1>
          <p>Descubra produtos incríveis com preços que cabem no seu bolso.</p>
          <button className="btn-destaque" onClick={handleVerOfertas}>Ver Ofertas</button>
        </div>
      </section>

      <div className="conteudo-layout">

        <aside className="sidebar">
          <h3>Categorias</h3>
          <ul className="lista-categorias">
            <li
              className={categoriaAtiva === '' ? 'ativo' : ''}
              onClick={() => handleFiltrarCategoria('', '')}
            >
              Todos os Produtos
            </li>
            {categorias.map(cat => (
              <li
                key={cat.id}
                className={categoriaAtiva === cat.slug ? 'ativo' : ''}
                onClick={() => handleFiltrarCategoria(cat.slug, cat.nome)}
              >
                {cat.nome}
              </li>
            ))}
          </ul>
        </aside>

        <main className="vitrine-flex">
          <section className="vitrine" style={{ padding: '0' }}>
            <div className="cabecalho-secao">
              <h2 className="titulo-secao" style={{ textAlign: 'left' }}>{tituloSecao}</h2>
            </div>

            <div className="grid-produtos">
              {carregando ? (
                <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: 'var(--texto-cinza)' }}>
                  Buscando no estoque...
                </p>
              ) : produtos.length > 0 ? (
                produtos.map((produto) => (
                  <div className="card" key={produto.id}>
                    {produto.preco_marketing_promocional > 0 && (
                      <div className="badge-promocao rosa">Oferta</div>
                    )}

                    <div className="img-placeholder" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                      {produto.imagem ? (
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '15px' }}
                        />
                      ) : (
                        <FiImage size={48} />
                      )}
                    </div>

                    <div className="card-info">
                      <h3 title={produto.nome}>
                        {produto.nome.length > 40 ? `${produto.nome.substring(0, 40)}...` : produto.nome}
                      </h3>
                      <div className="precos">
                        {produto.preco_marketing_promocional > 0 ? (
                          <>
                            <span className="preco-antigo">{produto.preco_formatado}</span>
                            <span className="preco-atual">{produto.preco_promo_formatado}</span>
                          </>
                        ) : (
                          <span className="preco-atual">{produto.preco_formatado}</span>
                        )}
                      </div>
                      <Link to={`/produto/${produto.slug}`} style={{ textDecoration: 'none' }}>
                        <button className="btn-comprar">Ver Detalhes</button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: 'var(--texto-cinza)' }}>
                  Nenhum produto encontrado. Tente outra palavra ou categoria!
                </p>
              )}
            </div>
          </section>
        </main>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <h2>BlastoStore</h2>
          <p>&copy; 2026. Feito com excelência por Kayque.</p>
        </div>
      </footer>
    </div>
  );
};

export default TelaPrincipal;