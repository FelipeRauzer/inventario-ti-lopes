import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { fazerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await fazerLogin(email, senha);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErro(detail || 'Email ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/src/assets/logo-lopes.png" alt="Lopes" className="login-logo-img" />
          <div>
            <div className="login-logo-title">Grupo Lopes</div>
            <div className="login-logo-sub">Inventário TI</div>
          </div>
        </div>

        <h2 className="login-title">Acesso ao Sistema</h2>
        <p className="login-subtitle">Entre com suas credenciais para continuar</p>

        {erro && <div className="alert-error">{erro}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={carregando} className="btn-primary login-btn">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          © 2026 Lopes Distribuidora — TI
        </div>
      </div>
    </div>
  );
}

export default Login;
