from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ativos import Ativo
from app.schemas.ativo import AtivoCreate, AtivoUpdate, AtivoResponse

router = APIRouter(prefix="/ativos", tags=["Ativos"])

@router.post("/", response_model=AtivoResponse, status_code=201)
def criar_ativo(ativo: AtivoCreate, db: Session = Depends(get_db)):
    novo = Ativo(**ativo.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/", response_model=list[AtivoResponse])
def listar_ativos(db: Session = Depends(get_db)):
    return db.query(Ativo).all()

@router.get("/{ativo_id}", response_model=AtivoResponse)
def buscar_ativo(ativo_id: int, db: Session = Depends(get_db)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")
    return ativo

@router.put("/{ativo_id}", response_model=AtivoResponse)
def atualizar_ativo(ativo_id: int, dados: AtivoUpdate, db: Session = Depends(get_db)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(ativo, campo, valor)

    db.commit()
    db.refresh(ativo)
    return ativo

@router.delete("/{ativo_id}", status_code=204)
def deletar_ativo(ativo_id: int, db: Session = Depends(get_db)):
    ativo = db.query(Ativo).filter(Ativo.id == ativo_id).first()
    if not ativo:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")

    db.delete(ativo)
    db.commit()