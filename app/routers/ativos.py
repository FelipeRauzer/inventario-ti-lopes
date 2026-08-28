from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ativos import Ativo
from app.models.usuario import Usuario
from app.schemas.ativo import AtivoCreate, AtivoUpdate, AtivoResponse
from app.services.winthor_service import buscar_funcionarios
from app.auth import login_obrigatorio

router = APIRouter(prefix="/ativos", tags=["Ativos"])

@router.post("/", response_model=AtivoResponse, status_code=201)
def criar_ativo(ativo: AtivoCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(login_obrigatorio)):
    existente = db.query(Ativo).filter(Ativo.numero_serie == ativo.numero_serie).first()
    if existente:
        raise HTTPException(status_code=400, detail="Número de série já cadastrado.")
    if ativo.status == "Descartado" and ativo.cod_func:
        raise HTTPException(status_code=400, detail="Ativo descartado não pode ser vinculado a um funcionário.")
    novo = Ativo(**ativo.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/", response_model=list[AtivoResponse])
def listar_ativos(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(login_obrigatorio)):
    return db.query(Ativo).all()

@router.get("/winthor/funcionarios")
def buscar_func_winthor(nome:str, usuario_atual: Usuario = Depends(login_obrigatorio)):
    resultados = buscar_funcionarios(nome)
    return resultados

@router.get("/{ativo_id}", response_model=AtivoResponse)
def buscar_ativo(ativo_id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(login_obrigatorio)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")
    return ativo

@router.put("/{ativo_id}", response_model=AtivoResponse)
def atualizar_ativo(ativo_id: int, dados: AtivoUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(login_obrigatorio)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")

    status_novo = dados.status or ativo.status
    func_novo = dados.cod_func if dados.cod_func is not None else ativo.cod_func
    if status_novo == "Descartado" and func_novo:
        raise HTTPException(status_code=400, detail="Ativo descartado não pode ser vinculado a um funcionário.")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(ativo, campo, valor)

    db.commit()
    db.refresh(ativo)
    return ativo

@router.delete("/{ativo_id}", status_code=204)
def deletar_ativo(ativo_id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(login_obrigatorio)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")

    db.delete(ativo)
    db.commit()