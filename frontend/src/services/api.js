import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ATIVOS ====================
export const criarAtivo = (dados) => api.post('/ativos/', dados);
export const listarAtivos = () => api.get('/ativos/');
export const buscarAtivo = (id) => api.get(`/ativos/${id}`);
export const atualizarAtivo = (id, dados) => api.put(`/ativos/${id}`, dados);
export const deletarAtivo = (id) => api.delete(`/ativos/${id}`);

// ==================== TERMOS ====================
export const criarTermo = (dados) => api.post('/termos/', dados);
export const listarTermosDoAtivo = (ativoId) => api.get(`/termos/ativo/${ativoId}`);
export const deletarTermo = (id) => api.delete(`/termos/${id}`);

// ==================== MOVIMENTAÇÕES ====================
export const criarMovimentacao = (dados) => api.post('/movimentacao/', dados);
export const listarMovimentacoesDoAtivo = (ativoId) => api.get(`/movimentacao/ativo/${ativoId}`);

export default api;
