import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TelaPrincipal from './pages/TelaPrincipal/telaPrincipal';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Perfil from './pages/Perfil/Perfil';
import ProdutoDetalhe from './pages/ProdutoDetalhe/ProdutoDetalhe';
import Carrinho from './pages/Carrinho/Carrinho';
import MeusPedidos from './pages/MeusPedidos/MeusPedidos';

function App() {
  const usuarioLogado = localStorage.getItem('nomeUsuario');

  return (
    <Router>
      <Routes>


        <Route
          path="/"
          element={usuarioLogado ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />


        <Route
          path="/home"
          element={usuarioLogado ? <TelaPrincipal /> : <Navigate to="/login" />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/perfil"
          element={usuarioLogado ? <Perfil /> : <Navigate to="/login" />}
        />

        <Route
          path="/produto/:slug"
          element={usuarioLogado ? <ProdutoDetalhe /> : <Navigate to="/login" />}
        />

        <Route path="/carrinho" element={<Carrinho />} />
        <Route
          path="/meus-pedidos"
          element={usuarioLogado ? <MeusPedidos /> : <Navigate to="/login" />}
        />

      </Routes>
    </Router>
  );
}

export default App;