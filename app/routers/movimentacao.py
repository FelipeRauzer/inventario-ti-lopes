from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.movimentacao import Movimentacao
from app.schemas.movimentacao import MovimentacaoCreate, MovimentacaoResponse


router = APIRouter(prefix="/movimentacao", tags=["Movimentacao"])

@router.post("/", response_model=MovimentacaoResponse, status_code=201)
def criar_movimentacao(movimentacao: MovimentacaoCreate, db: Session = Depends(get_db)):
    novo = Movimentacao(**movimentacao.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/ativo/{ativo_id}", response_model=list[MovimentacaoResponse])
def listar_movimentacao(ativo_id:int, db: Session = Depends(get_db)):
    return db.query(Movimentacao).filter(Movimentacao.ativo_id == ativo_id).all()


