import { useState, useEffect } from 'react';
import { listarAtivos } from '../services/api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [ativos, setAtivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarAtivos()
      .then((res) => setAtivos(res.data))
      .catch((err) => console.error('Erro ao carregar ativos:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  // Calcula estatísticas
  const total = ativos.length;

  const porTipo = ativos.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {});

  const porStatus = ativos.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const porFilial = ativos.reduce((acc, a) => {
    if (a.cod_filial) {
      acc[`Filial ${a.cod_filial}`] = (acc[`Filial ${a.cod_filial}`] || 0) + 1;
    }
    return acc;
  }, {});

  const statusColors = {
    'Ativo': 'bg-green-500',
    'Em manutenção': 'bg-yellow-500',
    'Disponível': 'bg-blue-500',
    'Descartado': 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <Link
          to="/ativos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Ativo
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total de Ativos</p>
          <p className="text-3xl font-bold text-white mt-1">{total}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Ativos em uso</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{porStatus['Ativo'] || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Em manutenção</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{porStatus['Em manutenção'] || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Disponíveis</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{porStatus['Disponível'] || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por tipo */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Por Tipo</h2>
          {Object.keys(porTipo).length === 0 ? (
            <p className="text-gray-500">Nenhum ativo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(porTipo)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, count]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-gray-300">{tipo}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Por status */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Por Status</h2>
          {Object.keys(porStatus).length === 0 ? (
            <p className="text-gray-500">Nenhum ativo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(porStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                      <span className="text-gray-300">{status}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos cadastrados */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Últimos Cadastrados</h2>
        {ativos.length === 0 ? (
          <p className="text-gray-500">Nenhum ativo cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-3 px-2">Hostname</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Marca/Modelo</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {ativos.slice(-5).reverse().map((ativo) => (
                  <tr key={ativo.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-2">
                      <Link to={`/ativos/${ativo.id}`} className="text-blue-400 hover:underline">
                        {ativo.hostname || '-'}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-gray-300">{ativo.tipo}</td>
                    <td className="py-3 px-2 text-gray-300">{ativo.marca} {ativo.modelo}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[ativo.status]
                          ? `${statusColors[ativo.status]} text-white`
                          : 'bg-gray-600 text-gray-200'
                      }`}>
                        {ativo.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400 font-mono text-xs">{ativo.ip || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
