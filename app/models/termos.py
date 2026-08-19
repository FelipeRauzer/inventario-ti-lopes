from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy import func
from app.database import Base

class Termo(Base):
    __tablename__ = "termos"

    id = Column(Integer,primary_key=True, autoincrement=True)
    ativo_id = Column(Integer, ForeignKey("ativos.id"), nullable=False)
    cod_func = Column(Integer, nullable=False)
    arquivo_pdf = Column(String(300), nullable=False)
    data_assinatura = Column(Date)
    data_registro = Column(DateTime, server_default=func.now())