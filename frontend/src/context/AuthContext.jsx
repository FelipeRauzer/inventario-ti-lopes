import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao iniciar, verifica se já tem token salvo
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');
    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  const fazerLogin = async (email, senha) => {
    const response = await loginApi(email, senha);
    const { access_token } = response.data;

    // Salva o token
    localStorage.setItem('token', access_token);

    // Decodifica o token pra pegar info do usuário (sem biblioteca extra)
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    const dadosUsuario = { email: payload.sub };
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);

    return dadosUsuario;
  };

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ usuario, fazerLogin, fazerLogout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
