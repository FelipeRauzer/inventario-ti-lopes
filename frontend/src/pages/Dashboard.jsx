import { useState, useEffect } from 'react';
import { listarAtivos, listarMovimentacoesDoAtivo } from '../services/api';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

function Dashboard() {
  const [ativos, setAtivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarAtivos()
      .then((res) => setAtivos(res.data))
      .catch((err) => console.error('Erro:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando...</div>;

  const total = ativos.length;
  const atv = ativos.filter(a => a.status === 'Ativo').length;
  const manutencao = ativos.filter(a => a.status === 'Em manutenção').length;
  const disponivel = ativos.filter(a => a.status === 'Disponível').length;
  const descartado = ativos.filter(a => a.status === 'Descartado').length;

  const porTipo = ativos.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {});

  const porFilial = ativos.reduce((acc, a) => {
    if (a.cod_filial) {
      acc[`Filial ${a.cod_filial}`] = (acc[`Filial ${a.cod_filial}`] || 0) + 1;
    }
    return acc;
  }, {});

  const valorTotal = ativos.reduce((acc, a) => acc + (a.valor_estimado || 0), 0);

  const tipoColors = ['#1B3A5C', '#E8732A', '#3B82F6', '#6B7280', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6'];

  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🖥️</div>
          <div className="stat-info">
            <span className="stat-label">ATIVOS CADASTRADOS</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <span className="stat-label">EM USO</span>
            <span className="stat-value">{atv}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔧</div>
          <div className="stat-info">
            <span className="stat-label">EM MANUTENÇÃO</span>
            <span className="stat-value">{manutencao}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📦</div>
          <div className="stat-info">
            <span className="stat-label">VALOR TOTAL ESTIMADO</span>
            <span className="stat-value">R$ {valorTotal.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Por Tipo */}
        <div className="panel">
          <div className="panel-header">
            <h2>Ativos por Tipo</h2>
          </div>
          <div className="panel-body">
            {Object.keys(porTipo).length === 0 ? (
              <p className="empty-text">Nenhum ativo cadastrado</p>
            ) : (
              <div className="type-list">
                {Object.entries(porTipo).sort((a,b) => b[1]-a[1]).map(([tipo, count], i) => (
                  <div key={tipo} className="type-item">
                    <div className="type-info">
                      <span className="type-dot" style={{background: tipoColors[i % tipoColors.length]}} />
                      <span>{tipo}</span>
                    </div>
                    <div className="type-bar-wrap">
                      <div className="type-bar" style={{width: `${(count/total)*100}%`, background: tipoColors[i % tipoColors.length]}} />
                    </div>
                    <span className="type-count">{count} ({Math.round((count/total)*100)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Por Status */}
        <div className="panel">
          <div className="panel-header">
            <h2>Ativos por Status</h2>
          </div>
          <div className="panel-body">
            <div className="status-grid">
              <div className="status-item green-bg">
                <span className="status-count">{atv}</span>
                <span className="status-label">Ativo</span>
              </div>
              <div className="status-item yellow-bg">
                <span className="status-count">{manutencao}</span>
                <span className="status-label">Manutenção</span>
              </div>
              <div className="status-item blue-bg">
                <span className="status-count">{disponivel}</span>
                <span className="status-label">Disponível</span>
              </div>
              <div className="status-item red-bg">
                <span className="status-count">{descartado}</span>
                <span className="status-label">Descartado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimos Cadastrados */}
      <div className="panel" style={{marginTop: '24px'}}>
        <div className="panel-header">
          <h2>Últimos Ativos Cadastrados</h2>
          <Link to="/ativos" className="btn-link">Ver todos</Link>
        </div>
        <div className="panel-body">
          {ativos.length === 0 ? (
            <p className="empty-text">Nenhum ativo cadastrado ainda.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>HOSTNAME</th>
                  <th>TIPO</th>
                  <th>MARCA / MODELO</th>
                  <th>SERIAL</th>
                  <th>IP</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {ativos.slice(-5).reverse().map((a) => (
                  <tr key={a.id}>
                    <td><Link to={`/ativos/${a.id}`} className="link">{a.hostname || '-'}</Link></td>
                    <td>{a.tipo}</td>
                    <td>{a.marca} {a.modelo}</td>
                    <td className="mono">{a.numero_serie}</td>
                    <td className="mono">{a.ip || '-'}</td>
                    <td><span className={`badge ${a.status === 'Ativo' ? 'badge-green' : a.status === 'Em manutenção' ? 'badge-yellow' : a.status === 'Disponível' ? 'badge-blue' : 'badge-red'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
