from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    admin: bool = False
    ativo: bool = True
    senha: str
    data_cadastro: date

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    admin: Optional[bool] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: int
    nome:str
    email: str
    admin: bool
    ativo: bool
    
    model_config = {"from_attributes": True}
