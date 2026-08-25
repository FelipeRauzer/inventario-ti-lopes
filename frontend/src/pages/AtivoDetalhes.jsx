import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buscarAtivo, deletarAtivo, listarMovimentacoesDoAtivo, listarTermosDoAtivo, criarTermo, deletarTermo } from '../services/api';
import TopBar from '../components/TopBar';

function AtivoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ativo, setAtivo] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload de termo
  const [showUpload, setShowUpload] = useState(false);
  const [termoCodFunc, setTermoCodFunc] = useState('');
  const [termoData, setTermoData] = useState('');
  const [termoArquivo, setTermoArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erroTermo, setErroTermo] = useState('');

  const carregarDados = () => {
    Promise.all([buscarAtivo(id), listarMovimentacoesDoAtivo(id), listarTermosDoAtivo(id)])
      .then(([a, m, t]) => { setAtivo(a.data); setMovimentacoes(m.data); setTermos(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregarDados(); }, [id]);

  const handleDeletar = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este ativo?')) return;
    try { await deletarAtivo(id); navigate('/ativos'); } catch { alert('Erro ao deletar.'); }
  };

  const handleUploadTermo = async (e) => {
    e.preventDefault();
    setErroTermo('');
    setEnviando(true);

    const formData = new FormData();
    formData.append('ativo_id', id);
    formData.append('cod_func', termoCodFunc);
    formData.append('data_assinatura', termoData);
    formData.append('arquivo', termoArquivo);

    try {
      await criarTermo(formData);
      setShowUpload(false);
      setTermoCodFunc('');
      setTermoData('');
      setTermoArquivo(null);
      carregarDados();
    } catch (err) {
      setErroTermo(err.response?.data?.detail || 'Erro ao enviar termo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletarTermo = async (termoId) => {
    if (!window.confirm('Excluir este termo?')) return;
    try { await deletarTermo(termoId); carregarDados(); } catch { alert('Erro ao excluir.'); }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (!ativo) return <div className="alert-error">Ativo não encontrado.</div>;

  const Info = ({ label, value }) => (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '-'}</span>
    </div>
  );

  return (
    <div>
      <TopBar title={ativo.hostname || 'Detalhes do Ativo'} />

      <div className="page-actions">
        <Link to="/ativos" className="btn-link">← Voltar para lista</Link>
        <div className="action-buttons">
          <Link to={`/ativos/${id}/editar`} className="btn-warning">Editar</Link>
          <button onClick={handleDeletar} className="btn-danger">Excluir</button>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-title-row">
          <h2>{ativo.hostname}</h2>
          <span className={`badge ${ativo.status === 'Ativo' ? 'badge-green' : ativo.status === 'Em manutenção' ? 'badge-yellow' : ativo.status === 'Disponível' ? 'badge-blue' : 'badge-red'}`}>{ativo.status}</span>
        </div>
        <span className="detail-subtitle">{ativo.tipo} — {ativo.marca} {ativo.modelo}</span>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header"><h2>Identificação</h2></div>
          <div className="panel-body">
            <div className="detail-grid">
              <Info label="Marca" value={ativo.marca} />
              <Info label="Modelo" value={ativo.modelo} />
              <Info label="Nº Série" value={ativo.numero_serie} />
              <Info label="IP" value={ativo.ip} />
              <Info label="Uso Específico" value={ativo.uso_especifico} />
              <Info label="Chip Celular" value={ativo.chip_celular} />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><h2>Especificações</h2></div>
          <div className="panel-body">
            <div className="detail-grid">
              <Info label="Processador" value={ativo.processador} />
              <Info label="RAM" value={ativo.ram_quantidade ? `${ativo.ram_quantidade} ${ativo.ram_tipo || ''}` : null} />
              <Info label="Armazenamento" value={ativo.armazenamento} />
              <Info label="Sistema" value={ativo.sistema_operacional} />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><h2>Financeiro e Datas</h2></div>
          <div className="panel-body">
            <div className="detail-grid">
              <Info label="Valor Estimado" value={ativo.valor_estimado ? `R$ ${ativo.valor_estimado.toLocaleString('pt-BR')}` : null} />
              <Info label="Data Fabricação" value={ativo.data_fabricacao} />
              <Info label="Previsão Troca" value={ativo.previsao_troca} />
              <Info label="Cadastrado em" value={ativo.data_cadastro ? new Date(ativo.data_cadastro).toLocaleDateString('pt-BR') : null} />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><h2>Responsável</h2></div>
          <div className="panel-body">
            <div className="detail-grid">
              <Info label="Cód. Funcionário" value={ativo.cod_func} />
              <Info label="Cód. Setor" value={ativo.cod_setor} />
              <Info label="Cód. Filial" value={ativo.cod_filial} />
            </div>
          </div>
        </div>
      </div>

      {/* Movimentações */}
      <div className="panel" style={{marginTop: 24}}>
        <div className="panel-header"><h2>Histórico de Movimentações ({movimentacoes.length})</h2></div>
        <div className="panel-body">
          {movimentacoes.length === 0 ? <p className="empty-text">Nenhuma movimentação.</p> : (
            <table className="data-table">
              <thead><tr><th>DATA</th><th>TIPO</th><th>MOTIVO</th><th>STATUS</th></tr></thead>
              <tbody>
                {movimentacoes.map(m => (
                  <tr key={m.id}>
                    <td>{m.data_movimentacao}</td>
                    <td><span className="badge badge-blue">{m.tipo}</span></td>
                    <td>{m.motivo || '-'}</td>
                    <td>{m.status_origem && m.status_destino ? `${m.status_origem} → ${m.status_destino}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Termos */}
      <div className="panel" style={{marginTop: 24}}>
        <div className="panel-header">
          <h2>Termos de Responsabilidade ({termos.length})</h2>
          <button onClick={() => setShowUpload(!showUpload)} className="btn-primary">
            {showUpload ? 'Cancelar' : '+ Anexar Termo'}
          </button>
        </div>
        <div className="panel-body">
          {/* Formulário de upload */}
          {showUpload && (
            <div className="upload-form">
              {erroTermo && <div className="alert-error">{erroTermo}</div>}
              <form onSubmit={handleUploadTermo}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Cód. Funcionário *</label>
                    <input type="number" value={termoCodFunc} onChange={(e) => setTermoCodFunc(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Data de Assinatura *</label>
                    <input type="date" value={termoData} onChange={(e) => setTermoData(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Arquivo PDF *</label>
                    <input type="file" accept=".pdf" onChange={(e) => setTermoArquivo(e.target.files[0])} required />
                  </div>
                </div>
                <button type="submit" disabled={enviando} className="btn-primary" style={{marginTop: 12}}>
                  {enviando ? 'Enviando...' : 'Enviar Termo'}
                </button>
              </form>
            </div>
          )}

          {/* Lista de termos */}
          {termos.length === 0 && !showUpload ? <p className="empty-text">Nenhum termo anexado.</p> : (
            <div className="termos-list" style={{marginTop: showUpload ? 20 : 0}}>
              {termos.map(t => (
                <div key={t.id} className="termo-item">
                  <span>📄</span>
                  <div style={{flex: 1}}>
                    <div>Funcionário: {t.cod_func}</div>
                    <div className="termo-date">Assinado em: {t.data_assinatura}</div>
                  </div>
                  <button onClick={() => handleDeletarTermo(t.id)} className="action-delete">Excluir</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AtivoDetalhes;