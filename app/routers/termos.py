from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.termos import Termo
from app.schemas.termo import TermoCreate, TermoResponse
import os       
import uuid
from datetime import date
from app.config import settings


router = APIRouter(prefix="/termos", tags=["Termos"])

@router.post("/", response_model=TermoResponse, status_code=201)
async def criar_termo(
    ativo_id: int = Form(...),
    cod_func: int = Form(...),
    data_assinatura: date = Form(...),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    #Verifica se é PDF
    if not arquivo.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são Aceitos.")

    #Lê o arquivo
    conteudo = await arquivo.read()

    #Valida se o tamanho do arquivo ultrapassa o limite
    if len(conteudo) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo excede o tamanho de 10 Mb")

    #Cria pasta de uploads
    os.makedirs(settings.upload_dir, exist_ok=True)

    #padroniza o nome do arquivo
    nome_arquivo = f"{uuid.uuid4()}_{arquivo.filename}"
    caminho = os.path.join(settings.upload_dir, nome_arquivo)
    with open(caminho, "wb") as f:
        f.write(conteudo)

    #salva caminho no bd
    termo = Termo(
        ativo_id=ativo_id,
        cod_func=cod_func,
        arquivo_pdf=caminho,
        data_assinatura=data_assinatura
   )
    db.add(termo)
    db.commit()
    db.refresh(termo)
    return termo

    
    
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
