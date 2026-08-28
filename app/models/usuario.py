from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean 
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func 
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios" 
    id = Column(Integer,primary_key=True, autoincrement=True)
    nome = Column(String(30), nullable=False)
    email = Column(String(150), nullable=False)
    admin = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)
    senha = Column(String(300), nullable=False)
    data_cadastro = Column(DateTime, server_default=func.now())
