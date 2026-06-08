import React from 'react';
import { FiShoppingCart, FiImage, FiUser, FiLogOut } from 'react-icons/fi'; // Adicionei o FiLogOut aqui
import { Link, useNavigate } from 'react-router-dom'; // Adicionei o useNavigate aqui
import './TelaPrincipal.css';

// Importando a sua nova imagem de logo
import logoImg from '../../assets/logo.png';

const TelaPrincipal = () => {
  const navigate = useNavigate(); // Inicializa o redirecionador
  
  // Puxando o nome do usuário logado
  const nomeUsuario = localStorage.getItem('nomeUsuario') || "Visitante";

  // Função mágica do Logout
  const handleLogout = () => {
    // 1. Remove o nome do usuário da memória (tira o crachá)
    localStorage.removeItem('nomeUsuario');
    // 2. Joga ele de volta para a tela de login
    navigate('/login');
  };

  return (
    <div className="tela-principal">
      {/* CABEÇALHO ATUALIZADO */}
      <header className="navbar">
        
        {/* LOGO E NOME */}
        <div className="logo">
          <img src={logoImg} alt="Logo Kayque Store" className="logo-img" />
          <h2>Kayque<span>Store</span></h2>
        </div>
        
        {/* MENU CENTRAL */}
        <nav className="menu">
          <Link to="/">Início</Link>
          <a href="#">Categorias</a>
          <a href="#">Ofertas</a>
        </nav>
        
        {/* ÁREA DO USUÁRIO (Saudação, Perfil, Logout e Carrinho) */}
        <div className="acoes-usuario">
          <span className="saudacao">Olá, <strong>{nomeUsuario}</strong>!</span>
          
          <Link to="/perfil" className="btn-perfil" title="Meu Perfil">
            <FiUser size={20} />
          </Link>

          {/* NOVO BOTÃO DE LOGOUT AQUI */}
          <button onClick={handleLogout} className="btn-logout" title="Sair da Conta">
            <FiLogOut size={20} />
          </button>
          
          <button className="carrinho-btn">
            <FiShoppingCart size={20} /> Carrinho <span className="badge-contador">0</span>
          </button>
        </div>

      </header>

      <main>
        {/* BANNER HERO (Destaque Amarelo) */}
        <section className="hero">
          <div className="hero-content">
            <span className="tag-lancamento">Nova Coleção 2026</span>
            <h1>Tecnologia e Estilo em um só lugar.</h1>
            <p>Descubra produtos incríveis com preços que cabem no seu bolso.</p>
            <button className="btn-destaque">Ver Ofertas</button>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS */}
        <section className="vitrine">
          <div className="cabecalho-secao">
            <h2 className="titulo-secao">Destaques da Semana</h2>
          </div>
          
          <div className="grid-produtos">
            {/* Produto 1 */}
            <div className="card">
              <div className="badge-promocao">-20%</div>
              <div className="img-placeholder">
                <FiImage size={48} />
              </div>
              <div className="card-info">
                <h3>Cubo Mágico Profissional</h3>
                <div className="precos">
                  <span className="preco-antigo">R$ 120,00</span>
                  <span className="preco-atual">R$ 96,00</span>
                </div>
                <button className="btn-comprar">Comprar Agora</button>
              </div>
            </div>

            {/* Produto 2 */}
            <div className="card">
              <div className="img-placeholder">
                <FiImage size={48} />
              </div>
              <div className="card-info">
                <h3>Caneca Personalizada</h3>
                <div className="precos">
                  <span className="preco-atual">R$ 45,90</span>
                </div>
                <button className="btn-comprar">Comprar Agora</button>
              </div>
            </div>

            {/* Produto 3 */}
            <div className="card">
              <div className="badge-promocao rosa">Frete Grátis</div>
              <div className="img-placeholder">
                <FiImage size={48} />
              </div>
              <div className="card-info">
                <h3>Camiseta Algodão Premium</h3>
                <div className="precos">
                  <span className="preco-atual">R$ 89,90</span>
                </div>
                <button className="btn-comprar">Comprar Agora</button>
              </div>
            </div>
            
            {/* Produto 4 */}
            <div className="card">
              <div className="img-placeholder">
                <FiImage size={48} />
              </div>
              <div className="card-info">
                <h3>Headset Gamer 7.1</h3>
                <div className="precos">
                  <span className="preco-atual">R$ 250,00</span>
                </div>
                <button className="btn-comprar">Comprar Agora</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ AZUL TRANQUILO */}
      <footer className="footer">
        <div className="footer-content">
          <h2>Kayque Store</h2>
          <p>&copy; 2026. Feito com excelência por Kayque Dinamic.</p>
        </div>
      </footer>
    </div>
  );
};

export default TelaPrincipal;