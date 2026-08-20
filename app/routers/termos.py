from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.termos import Termo
from app.schemas.termo import TermoCreate, TermoResponse

router = APIRouter(prefix="/termos", tags=["Termos"])

@router.post("/", response_model=TermoResponse, status_code=201)
def criar_termo(termo: TermoCreate, db: Session = Depends(get_db)):
    novo = Termo(**termo.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/ativo/{ativo_id}", response_model=list[TermoResponse])
def buscar_termo(ativo_id: int, db: Session =  Depends(get_db)):
    return db.query(Termo).filter(Termo.ativo_id == ativo_id).all()
    

@router.delete("/{termo_id}", status_code=204)
def deletar_termo(termo_id: int, db: Session = Depends(get_db)):
    termo = db.query(Termo).filter(Termo.id == termo_id).first()
    if not termo:
        raise HTTPException(status_code=404, detail="Termo não encontrado.")
    db.delete(termo)
    db.commit()
