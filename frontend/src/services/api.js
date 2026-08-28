import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor — adiciona o token em todo request automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — se vier 401, desloga automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Ativos
export const criarAtivo = (dados) => api.post('/ativos/', dados);
export const listarAtivos = () => api.get('/ativos/');
export const buscarAtivo = (id) => api.get(`/ativos/${id}`);
export const atualizarAtivo = (id, dados) => api.put(`/ativos/${id}`, dados);
export const deletarAtivo = (id) => api.delete(`/ativos/${id}`);

// Winthor
export const buscarFuncionarios = (nome) => api.get(`/ativos/winthor/funcionarios?nome=${nome}`);

// Termos
export const criarTermo = (formData) => api.post('/termos/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const listarTermosDoAtivo = (id) => api.get(`/termos/ativo/${id}`);
export const deletarTermo = (id) => api.delete(`/termos/${id}`);

// Movimentações
export const criarMovimentacao = (dados) => api.post('/movimentacao/', dados);
export const listarMovimentacoesDoAtivo = (id) => api.get(`/movimentacao/ativo/${id}`);

// Auth
export const login = (email, senha) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', senha);
  return axios.post('http://localhost:8000/auth/login', formData);
};

export default api;
