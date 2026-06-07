import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TelaPrincipal from './pages/TelaPrincipal/telaPrincipal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaPrincipal />} />
        {/* Futuramente você adicionará rotas como: */}
        {/* <Route path="/produto/:slug" element={<DetalheProduto />} /> */}
      </Routes>
    </Router>
  );
}

export default App;