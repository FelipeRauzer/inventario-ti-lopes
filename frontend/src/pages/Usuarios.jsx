import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import api from '../services/api';

function Usuarios() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', admin: false, ativo: true,
  });

  const carregar = () => {
    setLoading(true);
    api.get('/usuario/')
      .then(r => setUsuarios(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: '', email: '', senha: '', admin: false, ativo: true });
    setErro('');
    setShowForm(true);
  };

  const abrirEditar = (u) => {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, senha: '', admin: u.admin, ativo: u.ativo });
    setErro('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setSalvando(true);

    const dados = { ...form };
    if (!dados.senha) delete dados.senha; // não manda senha vazia no update

    try {
      if (editando) {
        await api.put(`/usuario/${editando.id}`, dados);
      } else {
        await api.post('/usuario/', dados);
      }
      setShowForm(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Excluir o usuário "${nome}"?`)) return;
    try {
      await api.delete(`/usuario/${id}`);
      carregar();
    } catch { alert('Erro ao excluir.'); }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <TopBar title="Usuários" />

      <div className="page-actions">
        <p className="result-count">{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}</p>
        <button onClick={abrirNovo} className="btn-primary">+ Novo Usuário</button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-header">
            <h2>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
          <div className="panel-body">
            {erro && <div className="alert-error" style={{ marginBottom: 16 }}>{erro}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Nome *</label>
                  <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{editando ? 'Nova Senha (deixe vazio pra manter)' : 'Senha *'}</label>
                  <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required={!editando} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.admin} onChange={e => setForm({ ...form, admin: e.target.checked })} />
                  Administrador
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
                  Ativo
                </label>
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="panel">
        <div className="panel-body no-padding">
          <table className="data-table">
            <thead>
              <tr>
                <th>NOME</th>
                <th>EMAIL</th>
                <th>PERFIL</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan="5" className="empty-row">Nenhum usuário cadastrado.</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.admin ? 'badge-blue' : 'badge-green'}`}>
                      {u.admin ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.ativo ? 'badge-green' : 'badge-red'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-links">
                      <button onClick={() => abrirEditar(u)} className="action-edit">Editar</button>
                      <button onClick={() => handleDeletar(u.id, u.nome)} className="action-delete">Excluir</button>
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

export default Usuarios;