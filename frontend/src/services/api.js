import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

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

export default api;
