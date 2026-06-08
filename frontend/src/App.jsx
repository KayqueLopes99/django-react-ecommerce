import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TelaPrincipal from './pages/TelaPrincipal/telaPrincipal';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';

function App() {
  // O SEGURANÇA: Verifica se o cliente tem o "crachá" na memória do navegador
  const usuarioLogado = localStorage.getItem('nomeUsuario');

  return (
    <Router>
      <Routes>
        
        {/* 1. A ROTA RAIZ: O que acontece quando abre http://localhost:5173/
            Se estiver logado, joga para o /home. Se não, joga direto pro /login! */}
        <Route 
          path="/" 
          element={usuarioLogado ? <Navigate to="/home" /> : <Navigate to="/login" />} 
        />

        {/* 2. PROTEGENDO A VITRINE: Se tentarem digitar /home direto na URL sem logar, 
            são arremessados de volta pro /login */}
        <Route 
          path="/home" 
          element={usuarioLogado ? <TelaPrincipal /> : <Navigate to="/login" />} 
        />
        
        {/* ROTAS LIVRES */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

      </Routes>
    </Router>
  );
}

export default App;