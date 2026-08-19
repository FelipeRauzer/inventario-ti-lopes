from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class AtivoCreate(BaseModel):
    hostname: str
    tipo: str
    marca: str
    modelo: str
    numero_serie: str
    ip: Optional[str] = None
    status: str
    processador: Optional[str] = None
    ram_quantidade: Optional[str] = None
    ram_tipo: Optional[str] = None
    armazenamento: Optional[str] = None
    sistema_operacional: Optional[str] = None
    chip_celular: Optional[str] = None
    uso_especifico: Optional[str] = None
    valor_estimado: Optional[float] = None
    data_fabricacao: Optional[date] = None
    previsao_troca: Optional[date] = None
    cod_func: Optional[int] = None
    cod_setor: Optional[int] = None
    cod_filial: Optional[int] = None

class AtivoUpdate(BaseModel):
    hostname: Optional[str] = None
    tipo: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    ip: Optional[str] = None
    status: Optional[str] = None
    processador: Optional[str] = None
    ram_quantidade: Optional[str] = None
    ram_tipo: Optional[str] = None
    armazenamento: Optional[str] = None
    sistema_operacional: Optional[str] = None
    chip_celular: Optional[str] = None
    uso_especifico: Optional[str] = None
    valor_estimado: Optional[float] = None
    data_fabricacao: Optional[date] = None
    previsao_troca: Optional[date] = None
    cod_func: Optional[int] = None
    cod_setor: Optional[int] = None
    cod_filial: Optional[int] = None

class AtivoResponse(BaseModel):
    id: int
    hostname: str
    tipo: str
    marca: str
    modelo: str
    numero_serie: str
    ip: Optional[str] = None
    status: str
    processador: Optional[str] = None
    ram_quantidade: Optional[str] = None
    ram_tipo: Optional[str] = None
    armazenamento: Optional[str] = None
    sistema_operacional: Optional[str] = None
    chip_celular: Optional[str] = None
    uso_especifico: Optional[str] = None
    valor_estimado: Optional[float] = None
    data_fabricacao: Optional[date] = None
    previsao_troca: Optional[date] = None
    cod_func: Optional[int] = None
    cod_setor: Optional[int] = None
    cod_filial: Optional[int] = None
    data_cadastro: Optional[datetime] = None
    ult_modificacao: Optional[datetime] = None

    model_config = {"from_attributes": True}