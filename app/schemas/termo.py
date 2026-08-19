from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class TermoCreate(BaseModel):
    ativo_id: int
    cod_func: int
    data_assinatura: date

class TermoResponse(BaseModel):
    id: int
    ativo_id: int
    cod_func: int
    arquivo_pdf: str
    data_assinatura: date
    data_registro: datetime

    model_config = {"from_attributes": True}