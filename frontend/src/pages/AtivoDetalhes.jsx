import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  buscarAtivo,
  deletarAtivo,
  listarMovimentacoesDoAtivo,
  listarTermosDoAtivo,
} from '../services/api';

function AtivoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ativo, setAtivo] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      buscarAtivo(id),
      listarMovimentacoesDoAtivo(id),
      listarTermosDoAtivo(id),
    ])
      .then(([ativoRes, movRes, termosRes]) => {
        setAtivo(ativoRes.data);
        setMovimentacoes(movRes.data);
        setTermos(termosRes.data);
      })
      .catch((err) => console.error('Erro:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeletar = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este ativo?')) return;
    try {
      await deletarAtivo(id);
      navigate('/ativos');
    } catch {
      alert('Erro ao deletar ativo.');
    }
  };

  const statusColors = {
    'Ativo': 'bg-green-500',
    'Em manutenção': 'bg-yellow-500',
    'Disponível': 'bg-blue-500',
    'Descartado': 'bg-red-500',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!ativo) {
    return <div className="text-red-400 text-center py-8">Ativo não encontrado.</div>;
  }

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-gray-200 mt-1">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/ativos" className="text-blue-400 hover:underline text-sm">
            ← Voltar para lista
          </Link>
          <h1 className="text-2xl font-bold text-gray-100 mt-2">{ativo.hostname || 'Sem hostname'}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-400">{ativo.tipo}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[ativo.status]
                ? `${statusColors[ativo.status]} text-white`
                : 'bg-gray-600 text-gray-200'
            }`}>
              {ativo.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/ativos/${id}/editar`}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={handleDeletar}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Identificação</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Marca" value={ativo.marca} />
            <InfoItem label="Modelo" value={ativo.modelo} />
            <InfoItem label="Nº Série" value={ativo.numero_serie} />
            <InfoItem label="IP" value={ativo.ip} />
            <InfoItem label="Uso Específico" value={ativo.uso_especifico} />
            <InfoItem label="Chip Celular" value={ativo.chip_celular} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Especificações</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Processador" value={ativo.processador} />
            <InfoItem label="RAM" value={ativo.ram_quantidade ? `${ativo.ram_quantidade} ${ativo.ram_tipo || ''}` : null} />
            <InfoItem label="Armazenamento" value={ativo.armazenamento} />
            <InfoItem label="Sistema Operacional" value={ativo.sistema_operacional} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Financeiro e Datas</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Valor Estimado" value={ativo.valor_estimado ? `R$ ${ativo.valor_estimado.toLocaleString('pt-BR')}` : null} />
            <InfoItem label="Data de Fabricação" value={ativo.data_fabricacao} />
            <InfoItem label="Previsão de Troca" value={ativo.previsao_troca} />
            <InfoItem label="Cadastrado em" value={ativo.data_cadastro ? new Date(ativo.data_cadastro).toLocaleDateString('pt-BR') : null} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Vínculo (Winthor)</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Cód. Funcionário" value={ativo.cod_func} />
            <InfoItem label="Cód. Setor" value={ativo.cod_setor} />
            <InfoItem label="Cód. Filial" value={ativo.cod_filial} />
          </div>
        </div>
      </div>

      {/* Movimentações */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Histórico de Movimentações ({movimentacoes.length})
        </h2>
        {movimentacoes.length === 0 ? (
          <p className="text-gray-500">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="space-y-3">
            {movimentacoes.map((mov) => (
              <div key={mov.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-medium">{mov.tipo}</span>
                  <span className="text-gray-400 text-sm">{mov.data_movimentacao}</span>
                </div>
                {mov.motivo && <p className="text-gray-300 text-sm mt-2">{mov.motivo}</p>}
                <div className="flex gap-6 mt-2 text-xs text-gray-400">
                  {mov.cod_func_origem && <span>Func. origem: {mov.cod_func_origem}</span>}
                  {mov.cod_func_destino && <span>Func. destino: {mov.cod_func_destino}</span>}
                  {mov.status_origem && <span>{mov.status_origem} → {mov.status_destino}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Termos */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Termos de Responsabilidade ({termos.length})
        </h2>
        {termos.length === 0 ? (
          <p className="text-gray-500">Nenhum termo anexado.</p>
        ) : (
          <div className="space-y-2">
            {termos.map((termo) => (
              <div key={termo.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-red-400">📄</span>
                  <div>
                    <p className="text-gray-200 text-sm">Func. {termo.cod_func}</p>
                    <p className="text-gray-400 text-xs">Assinado em: {termo.data_assinatura}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AtivoDetalhes;
