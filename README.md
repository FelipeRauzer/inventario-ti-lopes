# Inventário TI Lopes

Sistema web para controle e gestão de ativos de TI da Lopes Distribuidora.

## Como rodar

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/inventario-ti-lopes.git
cd inventario-ti-lopes
```

### 2. Crie o ambiente virtual
```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Instale as dependências
```bash
pip install -r requirements.txt
```

### 4. Configure o ambiente
```bash
cp .env.example .env
```
Edite o `.env` se necessário.

### 5. Rode o servidor
```bash
uvicorn app.main:app --reload
```

### 6. Acesse
- **API:** http://localhost:8000
- **Documentação Swagger:** http://localhost:8000/docs
- **Documentação ReDoc:** http://localhost:8000/redoc

## Estrutura do projeto

```
inventario-ti-lopes/
├── .env.example          # Variáveis de ambiente (modelo)
├── requirements.txt      # Dependências Python
├── REQUISITOS.md         # Documento de requisitos
├── app/
│   ├── main.py           # Ponto de entrada do FastAPI
│   ├── config.py         # Configurações (.env)
│   ├── database.py       # Conexão com o banco
│   ├── models/           # Tabelas do banco (SQLAlchemy)
│   ├── schemas/          # Validação de dados (Pydantic)
│   ├── routers/          # Endpoints da API
│   ├── services/         # Lógica de negócio e integração Winthor
│   └── uploads/          # PDFs dos termos de responsabilidade
└── alembic/              # Migrations do banco
```

## Stack

- **Backend:** Python + FastAPI
- **Banco (dev):** SQLite
- **Banco (produção):** PostgreSQL
- **Integração:** Oracle/Winthor (somente leitura)

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /ativos/ | Cadastrar ativo |
| GET | /ativos/ | Listar ativos (com filtros) |
| GET | /ativos/{id} | Buscar ativo por ID |
| PUT | /ativos/{id} | Atualizar ativo |
| DELETE | /ativos/{id} | Remover ativo |
| GET | /ativos/dashboard/resumo | Dashboard resumo |
| POST | /termos/ | Upload de termo (PDF) |
| GET | /termos/ativo/{id} | Termos de um ativo |
| POST | /movimentacoes/ | Registrar movimentação |
| GET | /movimentacoes/ativo/{id} | Histórico de um ativo |
