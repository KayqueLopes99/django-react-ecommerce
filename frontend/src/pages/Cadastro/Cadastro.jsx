import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi'; 
import './Cadastro.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    idade: '',
    data_nascimento: '',
    cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: 'SP' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      perfil: {
        idade: parseInt(formData.idade),
        data_nascimento: formData.data_nascimento,
        cpf: formData.cpf.replace(/\D/g, ''), 
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep.replace(/\D/g, ''),
        cidade: formData.cidade,
        estado: formData.estado
      }
    };

    try {
      const response = await fetch('http://localhost:8000/api/cadastro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        navigate('/login'); 
      } else {
        const data = await response.json();
        setErro(JSON.stringify(data)); 
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <div className="avatar-circle">
          <FiUserPlus size={40} color="#ffffff" />
        </div>
        
        <h2 className="cadastro-titulo">Criar Nova Conta</h2>
        
        {erro && <div className="mensagem-erro-cadastro">Revise os dados: {erro}</div>}

        <form onSubmit={handleCadastro} className="cadastro-form">
          
          <h3 className="sessao-titulo">Credenciais de Acesso</h3>
          <div className="form-grid">
            <input type="text" name="username" placeholder="Nome de Usuário" onChange={handleChange} required />
            <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required />
            
            {/* --- GRUPO DA SENHA COM O OLHINHO --- */}
            <div className="senha-group">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                name="password" 
                placeholder="Senha" 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className="btn-olhinho-cadastro"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

          </div>

          <h3 className="sessao-titulo">Dados Pessoais</h3>
          <div className="form-grid">
            <input type="text" name="first_name" placeholder="Primeiro Nome" onChange={handleChange} required />
            <input type="text" name="last_name" placeholder="Sobrenome" onChange={handleChange} required />
            <input type="text" name="cpf" placeholder="CPF (11 dígitos)" onChange={handleChange} required maxLength="14" />
            <input type="date" name="data_nascimento" onChange={handleChange} required />
            <input type="number" name="idade" placeholder="Idade" onChange={handleChange} required min="1" />
          </div>

          <h3 className="sessao-titulo">Endereço</h3>
          <div className="form-grid">
            <input type="text" name="cep" placeholder="CEP" onChange={handleChange} required maxLength="9" />
            <input type="text" name="endereco" placeholder="Endereço (Rua, Av)" onChange={handleChange} required />
            <input type="text" name="numero" placeholder="Número" onChange={handleChange} required />
            <input type="text" name="complemento" placeholder="Complemento" onChange={handleChange} />
            <input type="text" name="bairro" placeholder="Bairro" onChange={handleChange} required />
            <input type="text" name="cidade" placeholder="Cidade" onChange={handleChange} required />
            
            <select name="estado" value={formData.estado} onChange={handleChange} required>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>

          <button type="submit" className="cadastro-btn">FINALIZAR CADASTRO</button>
          
          <div className="cadastro-footer">
            Já tem uma conta? <Link to="/login">Faça Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;