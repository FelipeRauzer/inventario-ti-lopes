from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy import func
from app.database import Base

class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ativo_id = Column(Integer, ForeignKey("ativos.id"), nullable=False)
    tipo = Column(String(100), nullable=False)
    cod_func_origem = Column(Integer)
    cod_func_destino = Column(Integer)
    cod_setor_origem = Column(Integer)
    cod_setor_destino = Column(Integer)
    status_origem = Column(String(100))
    status_destino = Column(String(100))
    data_movimentacao = Column(Date, nullable=False)
    motivo = Column(String(500))
    data_registro = Column(DateTime, server_default=func.now())
