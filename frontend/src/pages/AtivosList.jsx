import { useState, useEffect } from 'react';
import { listarAtivos, deletarAtivo } from '../services/api';
import { Link } from 'react-router-dom';

function AtivosList() {
  const [ativos, setAtivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    carregarAtivos();
  }, []);

  const carregarAtivos = () => {
    setLoading(true);
    listarAtivos()
      .then((res) => setAtivos(res.data))
      .catch((err) => console.error('Erro:', err))
      .finally(() => setLoading(false));
  };

  const handleDeletar = async (id, hostname) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${hostname}"?`)) return;
    try {
      await deletarAtivo(id);
      carregarAtivos();
    } catch (err) {
      alert('Erro ao deletar ativo.');
    }
  };

  // Filtros locais
  const ativosFiltrados = ativos.filter((a) => {
    const matchBusca =
      !busca ||
      (a.hostname || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.ip || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.numero_serie || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.marca || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.modelo || '').toLowerCase().includes(busca.toLowerCase());

    const matchTipo = !filtroTipo || a.tipo === filtroTipo;
    const matchStatus = !filtroStatus || a.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  });

  const tipos = [...new Set(ativos.map((a) => a.tipo))].sort();
  const statuses = [...new Set(ativos.map((a) => a.status))].sort();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Ativos</h1>
        <Link
          to="/ativos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Ativo
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por hostname, IP, serial, marca..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 min-w-[250px] bg-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos os tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos os status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Contagem */}
      <p className="text-gray-400 text-sm">
        {ativosFiltrados.length} ativo{ativosFiltrados.length !== 1 ? 's' : ''} encontrado{ativosFiltrados.length !== 1 ? 's' : ''}
      </p>

      {/* Tabela */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-3 px-4">Hostname</th>
              <th className="text-left py-3 px-4">Tipo</th>
              <th className="text-left py-3 px-4">Marca / Modelo</th>
              <th className="text-left py-3 px-4">Nº Série</th>
              <th className="text-left py-3 px-4">IP</th>
              <th className="text-left py-3 px-4">Processador</th>
              <th className="text-left py-3 px-4">RAM</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ativosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  Nenhum ativo encontrado.
                </td>
              </tr>
            ) : (
              ativosFiltrados.map((ativo) => (
                <tr key={ativo.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-gray-200 font-medium">{ativo.hostname || '-'}</td>
                  <td className="py-3 px-4 text-gray-300">{ativo.tipo}</td>
                  <td className="py-3 px-4 text-gray-300">{ativo.marca} {ativo.modelo}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{ativo.numero_serie}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{ativo.ip || '-'}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{ativo.processador || '-'}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {ativo.ram_quantidade ? `${ativo.ram_quantidade} ${ativo.ram_tipo || ''}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[ativo.status]
                        ? `${statusColors[ativo.status]} text-white`
                        : 'bg-gray-600 text-gray-200'
                    }`}>
                      {ativo.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/ativos/${ativo.id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/ativos/${ativo.id}/editar`}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeletar(ativo.id, ativo.hostname)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AtivosList;
