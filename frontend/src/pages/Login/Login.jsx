import React, { useState } from 'react';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(''); 
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(''); 

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem('nomeUsuario', data.username);
        
        setSucesso("Login realizado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate('/home');
        }, 2000);
        
      } else {
        setErro(data.erro || 'Erro ao fazer login. Tente novamente.');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor. O backend está rodando?');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="avatar-circle">
          <FiUser size={40} color="#ffffff" />
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {erro && <p className="mensagem-erro">{erro}</p>}
          {sucesso && <p className="mensagem-sucesso">{sucesso}</p>}

          <div className="input-group">
            <span className="input-icon"><FiMail size={18} /></span>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon"><FiLock size={18} /></span>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="btn-olhinho"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" /> Lembre de mim
            </label>
          </div>

          <button type="submit" className="login-btn">LOGIN</button>
          
          <div className="cadastro-link">
            Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;