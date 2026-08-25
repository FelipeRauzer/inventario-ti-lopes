import { useState, useEffect } from 'react';
import { listarAtivos, deletarAtivo } from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';

function AtivosList() {
  const [ativos, setAtivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const buscaParam = searchParams.get('busca');
    if (buscaParam) setBusca(buscaParam);
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
    } catch { alert('Erro ao deletar.'); }
  };

  const ativosFiltrados = ativos.filter((a) => {
    const b = busca.toLowerCase();
    const matchBusca = !busca ||
      (a.hostname || '').toLowerCase().includes(b) ||
      (a.ip || '').toLowerCase().includes(b) ||
      (a.numero_serie || '').toLowerCase().includes(b) ||
      (a.marca || '').toLowerCase().includes(b) ||
      (a.modelo || '').toLowerCase().includes(b);
    return matchBusca && (!filtroTipo || a.tipo === filtroTipo) && (!filtroStatus || a.status === filtroStatus);
  });

  const tipos = [...new Set(ativos.map(a => a.tipo))].sort();
  const statuses = [...new Set(ativos.map(a => a.status))].sort();

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <TopBar title="Ativos" />

      <div className="page-actions">
        <div className="filters-bar">
          <input type="text" placeholder="Buscar por hostname, IP, serial, marca..." value={busca} onChange={(e) => setBusca(e.target.value)} className="filter-input" />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="filter-select">
            <option value="">Todos os tipos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="filter-select">
            <option value="">Todos os status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Link to="/ativos/novo" className="btn-primary">+ Novo Ativo</Link>
      </div>

      <p className="result-count">{ativosFiltrados.length} ativo{ativosFiltrados.length !== 1 ? 's' : ''} encontrado{ativosFiltrados.length !== 1 ? 's' : ''}</p>

      <div className="panel">
        <div className="panel-body no-padding">
          <table className="data-table">
            <thead>
              <tr>
                <th>HOSTNAME</th>
                <th>TIPO</th>
                <th>MARCA / MODELO</th>
                <th>Nº SÉRIE</th>
                <th>IP</th>
                <th>PROCESSADOR</th>
                <th>RAM</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {ativosFiltrados.length === 0 ? (
                <tr><td colSpan="9" className="empty-row">Nenhum ativo encontrado.</td></tr>
              ) : ativosFiltrados.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.hostname || '-'}</td>
                  <td>{a.tipo}</td>
                  <td>{a.marca} {a.modelo}</td>
                  <td className="mono">{a.numero_serie}</td>
                  <td className="mono">{a.ip || '-'}</td>
                  <td>{a.processador || '-'}</td>
                  <td>{a.ram_quantidade ? `${a.ram_quantidade} ${a.ram_tipo || ''}` : '-'}</td>
                  <td><span className={`badge ${a.status === 'Ativo' ? 'badge-green' : a.status === 'Em manutenção' ? 'badge-yellow' : a.status === 'Disponível' ? 'badge-blue' : 'badge-red'}`}>{a.status}</span></td>
                  <td>
                    <div className="action-links">
                      <Link to={`/ativos/${a.id}`} className="action-view">Ver</Link>
                      <Link to={`/ativos/${a.id}/editar`} className="action-edit">Editar</Link>
                      <button onClick={() => handleDeletar(a.id, a.hostname)} className="action-delete">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AtivosList;
