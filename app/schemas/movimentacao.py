from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MovimentacaoCreate(BaseModel):
    ativo_id: int
    tipo: str
    cod_func_origem: Optional[int] = None
    cod_func_destino: Optional[int]= None
    cod_setor_origem: Optional[int]= None
    cod_setor_destino: Optional[int] = None
    status_origem: Optional[str] = None 
    status_destino: Optional[str] = None
    data_movimentacao: date
    motivo: Optional[str] = None

class MovimentacaoResponse(BaseModel):
    id: int
    ativo_id: int
    tipo: str
    cod_func_origem: Optional[int] = None
    cod_func_destino: Optional[int] = None
    cod_setor_origem: Optional[int] = None
    cod_setor_destino: Optional[int] = None
    status_origem: Optional[str] = None
    status_destino: Optional[str] = None
    data_movimentacao: date
    motivo: Optional[str] = None
    data_registro: datetime

    model_config = {"from_attributes": True}