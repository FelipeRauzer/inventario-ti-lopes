from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func 
from app.database import Base

class Ativo(Base):
    __tablename__= "ativos"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hostname = Column(String(20), nullable=False)
    tipo = Column(String(50), nullable=False)
    marca = Column(String(100),nullable=False)
    modelo = Column(String(100), nullable=False)
    numero_serie = Column(String(50), nullable=False, unique=True)
    ip = Column(String(15))
    status = Column(String(20), nullable=False)
    processador = Column(String(100))
    ram_quantidade = Column(String(50))
    ram_tipo = Column(String(20))
    armazenamento = Column(String(100))
    sistema_operacional = Column(String(100))
    chip_celular = Column(String(30))
    uso_especifico = Column(String(200))
    valor_estimado = Column(Float)
    data_fabricacao = Column(Date)
    previsao_troca = Column(Date)
    cod_func = Column(Integer)
    cod_setor = Column(Integer)
    cod_filial = Column(Integer)
    data_cadastro = Column(DateTime, server_default=func.now())
    ult_modificacao = Column(DateTime, server_default=func.now(), onupdate=func.now())
    

