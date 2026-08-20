import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarAtivo, buscarAtivo, atualizarAtivo } from '../services/api';

function AtivoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    hostname: '',
    tipo: 'DeskTop',
    marca: '',
    modelo: '',
    numero_serie: '',
    ip: '',
    status: 'Ativo',
    processador: '',
    ram_quantidade: '',
    ram_tipo: '',
    armazenamento: '',
    sistema_operacional: '',
    chip_celular: '',
    uso_especifico: '',
    valor_estimado: '',
    data_fabricacao: '',
    previsao_troca: '',
    cod_func: '',
    cod_setor: '',
    cod_filial: '',
  });

  useEffect(() => {
    if (editando) {
      setLoading(true);
      buscarAtivo(id)
        .then((res) => {
          const dados = res.data;
          setForm({
            hostname: dados.hostname || '',
            tipo: dados.tipo || '',
            marca: dados.marca || '',
            modelo: dados.modelo || '',
            numero_serie: dados.numero_serie || '',
            ip: dados.ip || '',
            status: dados.status || '',
            processador: dados.processador || '',
            ram_quantidade: dados.ram_quantidade || '',
            ram_tipo: dados.ram_tipo || '',
            armazenamento: dados.armazenamento || '',
            sistema_operacional: dados.sistema_operacional || '',
            chip_celular: dados.chip_celular || '',
            uso_especifico: dados.uso_especifico || '',
            valor_estimado: dados.valor_estimado || '',
            data_fabricacao: dados.data_fabricacao || '',
            previsao_troca: dados.previsao_troca || '',
            cod_func: dados.cod_func || '',
            cod_setor: dados.cod_setor || '',
            cod_filial: dados.cod_filial || '',
          });
        })
        .catch(() => setErro('Erro ao carregar ativo.'))
        .finally(() => setLoading(false));
    }
  }, [id, editando]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    // Prepara dados — converte campos numéricos
    const dados = {
      ...form,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      cod_func: form.cod_func ? parseInt(form.cod_func) : null,
      cod_setor: form.cod_setor ? parseInt(form.cod_setor) : null,
      cod_filial: form.cod_filial ? parseInt(form.cod_filial) : null,
      data_fabricacao: form.data_fabricacao || null,
      previsao_troca: form.previsao_troca || null,
      ip: form.ip || null,
      chip_celular: form.chip_celular || null,
      uso_especifico: form.uso_especifico || null,
      processador: form.processador || null,
      ram_quantidade: form.ram_quantidade || null,
      ram_tipo: form.ram_tipo || null,
      armazenamento: form.armazenamento || null,
      sistema_operacional: form.sistema_operacional || null,
    };

    try {
      if (editando) {
        await atualizarAtivo(id, dados);
      } else {
        await criarAtivo(dados);
      }
      navigate('/ativos');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErro(detail || 'Erro ao salvar ativo.');
    } finally {
      setSalvando(false);
    }
  };

  const inputClass =
    'w-full bg-gray-700 text-gray-200 rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none';
  const labelClass = 'block text-gray-400 text-sm mb-1';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        {editando ? 'Editar Ativo' : 'Novo Ativo'}
      </h1>

      {erro && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Identificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Hostname *</label>
              <input name="hostname" value={form.hostname} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} required className={inputClass}>
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
            <div>
              <label className={labelClass}>Status *</label>
              <select name="status" value={form.status} onChange={handleChange} required className={inputClass}>
                <option value="Ativo">Ativo</option>
                <option value="Em manutenção">Em manutenção</option>
                <option value="Disponível">Disponível</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Marca *</label>
              <input name="marca" value={form.marca} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Modelo *</label>
              <input name="modelo" value={form.modelo} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nº Série *</label>
              <input name="numero_serie" value={form.numero_serie} onChange={handleChange} required className={inputClass} />
            </div>
          </div>
        </div>

        {/* Rede */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Rede</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>IP</label>
              <input name="ip" value={form.ip} onChange={handleChange} placeholder="192.168.0.100" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Chip Celular</label>
              <input name="chip_celular" value={form.chip_celular} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Especificações */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Especificações Técnicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Processador</label>
              <input name="processador" value={form.processador} onChange={handleChange} placeholder="Intel i5-1145G7" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RAM (quantidade)</label>
              <input name="ram_quantidade" value={form.ram_quantidade} onChange={handleChange} placeholder="8GB" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>RAM (tipo)</label>
              <select name="ram_tipo" value={form.ram_tipo} onChange={handleChange} className={inputClass}>
                <option value="">Selecione</option>
                <option value="DDR3">DDR3</option>
                <option value="DDR4">DDR4</option>
                <option value="DDR5">DDR5</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Armazenamento</label>
              <input name="armazenamento" value={form.armazenamento} onChange={handleChange} placeholder="256GB SSD" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sistema Operacional</label>
              <input name="sistema_operacional" value={form.sistema_operacional} onChange={handleChange} placeholder="Windows 11 Pro" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Uso Específico</label>
              <input name="uso_especifico" value={form.uso_especifico} onChange={handleChange} placeholder="Máquina de pigmentação" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Financeiro e datas */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Financeiro e Datas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Valor Estimado (R$)</label>
              <input name="valor_estimado" type="number" step="0.01" value={form.valor_estimado} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de Fabricação</label>
              <input name="data_fabricacao" type="date" value={form.data_fabricacao} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Previsão de Troca</label>
              <input name="previsao_troca" type="date" value={form.previsao_troca} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Vínculo Winthor */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Vínculo (Winthor)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cód. Funcionário</label>
              <input name="cod_func" type="number" value={form.cod_func} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cód. Setor</label>
              <input name="cod_setor" type="number" value={form.cod_setor} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cód. Filial</label>
              <input name="cod_filial" type="number" value={form.cod_filial} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Ativo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ativos')}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AtivoForm;
