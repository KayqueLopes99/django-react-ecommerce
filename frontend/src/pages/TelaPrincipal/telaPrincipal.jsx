import React from 'react';
import { FiShoppingCart, FiImage } from 'react-icons/fi';
import './TelaPrincipal.css';

const TelaPrincipal = () => {
  return (
    <div className="tela-principal">
      {/* CABEÇALHO LIMPO */}
      <header className="navbar">
        <div className="logo">
          <h2>Kayque<span>Store</span></h2>
        </div>
        <nav className="menu">
          <a href="#">Início</a>
          <a href="#">Categorias</a>
          <a href="#">Ofertas</a>
        </nav>
        <button className="carrinho-btn">
          <FiShoppingCart size={20} /> Carrinho <span className="badge-contador">0</span>
        </button>
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