import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarAtivo, buscarAtivo, atualizarAtivo, buscarFuncionarios } from '../services/api';
import TopBar from '../components/TopBar';

function AtivoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Winthor search
  const [buscaFunc, setBuscaFunc] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);
  const [buscandoFunc, setBuscandoFunc] = useState(false);
  const [funcSelecionado, setFuncSelecionado] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [form, setForm] = useState({
    hostname: '', tipo: 'DeskTop', marca: '', modelo: '', numero_serie: '',
    ip: '', status: 'Ativo', processador: '', ram_quantidade: '', ram_tipo: '',
    armazenamento: '', sistema_operacional: '', chip_celular: '',
    uso_especifico: '', valor_estimado: '', data_fabricacao: '', previsao_troca: '',
    cod_func: '', cod_setor: '', cod_filial: '',
  });

  useEffect(() => {
    if (editando) {
      setLoading(true);
      buscarAtivo(id)
        .then((res) => {
          const d = res.data;
          setForm({
            hostname: d.hostname || '', tipo: d.tipo || '', marca: d.marca || '',
            modelo: d.modelo || '', numero_serie: d.numero_serie || '', ip: d.ip || '',
            status: d.status || '', processador: d.processador || '',
            ram_quantidade: d.ram_quantidade || '', ram_tipo: d.ram_tipo || '',
            armazenamento: d.armazenamento || '', sistema_operacional: d.sistema_operacional || '',
            chip_celular: d.chip_celular || '', uso_especifico: d.uso_especifico || '',
            valor_estimado: d.valor_estimado || '', data_fabricacao: d.data_fabricacao || '',
            previsao_troca: d.previsao_troca || '', cod_func: d.cod_func || '',
            cod_setor: d.cod_setor || '', cod_filial: d.cod_filial || '',
          });
          if (d.cod_func) setFuncSelecionado({ codigo: d.cod_func, nome: `Matrícula ${d.cod_func}` });
        })
        .catch(() => setErro('Erro ao carregar ativo.'))
        .finally(() => setLoading(false));
    }
  }, [id, editando]);

  // Busca funcionários no Winthor com debounce
  useEffect(() => {
    if (buscaFunc.length < 2) { setFuncionarios([]); setShowDropdown(false); return; }
    const timer = setTimeout(() => {
      setBuscandoFunc(true);
      buscarFuncionarios(buscaFunc)
        .then((res) => { setFuncionarios(res.data); setShowDropdown(true); })
        .catch(() => setFuncionarios([]))
        .finally(() => setBuscandoFunc(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [buscaFunc]);

  const selecionarFunc = (func) => {
    setFuncSelecionado(func);
    setForm({ ...form, cod_func: func.codigo, cod_setor: func.cod_setor || '', cod_filial: func.cod_filial || '' });
    setBuscaFunc('');
    setShowDropdown(false);
  };

  const limparFunc = () => {
    setFuncSelecionado(null);
    setForm({ ...form, cod_func: '', cod_setor: '', cod_filial: '' });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setSalvando(true);
    const dados = {
      ...form,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      cod_func: form.cod_func ? parseInt(form.cod_func) : null,
      cod_setor: form.cod_setor ? parseInt(form.cod_setor) : null,
      cod_filial: form.cod_filial ? parseInt(form.cod_filial) : null,
      data_fabricacao: form.data_fabricacao || null,
      previsao_troca: form.previsao_troca || null,
      ip: form.ip || null, chip_celular: form.chip_celular || null,
      uso_especifico: form.uso_especifico || null, processador: form.processador || null,
      ram_quantidade: form.ram_quantidade || null, ram_tipo: form.ram_tipo || null,
      armazenamento: form.armazenamento || null, sistema_operacional: form.sistema_operacional || null,
    };
    try {
      if (editando) await atualizarAtivo(id, dados);
      else await criarAtivo(dados);
      navigate('/ativos');
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao salvar ativo.');
    } finally { setSalvando(false); }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <TopBar title={editando ? 'Editar Ativo' : 'Novo Ativo'} />

      {erro && <div className="alert-error">{erro}</div>}

      <form onSubmit={handleSubmit}>
        {/* Identificação */}
        <div className="panel">
          <div className="panel-header"><h2>Identificação</h2></div>
          <div className="panel-body">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Hostname *</label>
                <input name="hostname" value={form.hostname} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="DeskTop">DeskTop</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Celular">Celular</option>
                  <option value="Impressora">Impressora</option>
                  <option value="Switch">Switch</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Nobreak">Nobreak</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required>
                  <option value="Ativo">Ativo</option>
                  <option value="Em manutenção">Em manutenção</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marca *</label>
                <input name="marca" value={form.marca} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Modelo *</label>
                <input name="modelo" value={form.modelo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nº Série *</label>
                <input name="numero_serie" value={form.numero_serie} onChange={handleChange} required />
              </div>
            </div>
          </div>
        </div>

        {/* Rede */}
        <div className="panel">
          <div className="panel-header"><h2>Rede</h2></div>
          <div className="panel-body">
            <div className="form-grid-3">
              <div className="form-group">
                <label>IP</label>
                <input name="ip" value={form.ip} onChange={handleChange} placeholder="192.168.0.100" />
              </div>
              <div className="form-group">
                <label>Chip Celular</label>
                <input name="chip_celular" value={form.chip_celular} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Especificações */}
        <div className="panel">
          <div className="panel-header"><h2>Especificações Técnicas</h2></div>
          <div className="panel-body">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Processador</label>
                <input name="processador" value={form.processador} onChange={handleChange} placeholder="Intel i5-1145G7" />
              </div>
              <div className="form-group">
                <label>RAM (quantidade)</label>
                <input name="ram_quantidade" value={form.ram_quantidade} onChange={handleChange} placeholder="8GB" />
              </div>
              <div className="form-group">
                <label>RAM (tipo)</label>
                <select name="ram_tipo" value={form.ram_tipo} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="DDR3">DDR3</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </div>
              <div className="form-group">
                <label>Armazenamento</label>
                <input name="armazenamento" value={form.armazenamento} onChange={handleChange} placeholder="256GB SSD" />
              </div>
              <div className="form-group">
                <label>Sistema Operacional</label>
                <input name="sistema_operacional" value={form.sistema_operacional} onChange={handleChange} placeholder="Windows 11 Pro" />
              </div>
              <div className="form-group">
                <label>Uso Específico</label>
                <input name="uso_especifico" value={form.uso_especifico} onChange={handleChange} placeholder="Máquina de pigmentação" />
              </div>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="panel">
          <div className="panel-header"><h2>Financeiro e Datas</h2></div>
          <div className="panel-body">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Valor Estimado (R$)</label>
                <input name="valor_estimado" type="number" step="0.01" value={form.valor_estimado} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Data de Fabricação</label>
                <input name="data_fabricacao" type="date" value={form.data_fabricacao} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Previsão de Troca</label>
                <input name="previsao_troca" type="date" value={form.previsao_troca} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Funcionário Winthor */}
        <div className="panel">
          <div className="panel-header"><h2>Responsável (Winthor)</h2></div>
          <div className="panel-body">
            {funcSelecionado ? (
              <div className="func-selected">
                <div className="func-selected-info">
                  <span className="func-selected-icon">👤</span>
                  <div>
                    <div className="func-selected-name">{funcSelecionado.nome}</div>
                    <div className="func-selected-detail">
                      Matrícula: {funcSelecionado.codigo}
                      {funcSelecionado.cod_setor && ` | Setor: ${funcSelecionado.cod_setor}`}
                      {funcSelecionado.cod_filial && ` | Filial: ${funcSelecionado.cod_filial}`}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={limparFunc} className="btn-remove">✕ Remover</button>
              </div>
            ) : (
              <div className="func-search-wrap">
                <div className="form-group">
                  <label>Buscar funcionário pelo nome</label>
                  <input
                    value={buscaFunc}
                    onChange={(e) => setBuscaFunc(e.target.value)}
                    placeholder="Digite o nome do funcionário..."
                    autoComplete="off"
                  />
                  {buscandoFunc && <span className="search-loading">Buscando...</span>}
                </div>
                {showDropdown && funcionarios.length > 0 && (
                  <div className="func-dropdown">
                    {funcionarios.map((f) => (
                      <div key={f.codigo} className="func-option" onClick={() => selecionarFunc(f)}>
                        <span className="func-option-name">{f.nome}</span>
                        <span className="func-option-detail">Mat. {f.codigo} | Setor {f.cod_setor} | Filial {f.cod_filial}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && funcionarios.length === 0 && !buscandoFunc && (
                  <div className="func-dropdown">
                    <div className="func-option empty">Nenhum funcionário encontrado.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="form-actions">
          <button type="submit" disabled={salvando} className="btn-primary">
            {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Ativo'}
          </button>
          <button type="button" onClick={() => navigate('/ativos')} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default AtivoForm;
