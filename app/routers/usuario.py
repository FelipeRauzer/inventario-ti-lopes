from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.auth import login_obrigatorio, admin_obrigatorio
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBasic()
router = APIRouter(prefix="/usuario", tags=["Usuario"])

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha, senha_hash):
    return pwd_context.verify(senha, senha_hash)

@router.post("/", response_model=UsuarioResponse, status_code=201)
def criar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(admin_obrigatorio)):
    existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Usuário ja existente.")
    usuario.senha = hash_senha(usuario.senha)
    novo = Usuario(**usuario.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), usuario_atual: Usuario = Depends(admin_obrigatorio)):
    return db.query(Usuario).all()

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def buscar_usuario(usuario_id: int, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(admin_obrigatorio)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario não encontrado.")
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(usuario_id: int, dados: UsuarioUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(admin_obrigatorio)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario não encontrado.")
    if dados.senha:
        dados.senha = hash_senha(dados.senha)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario

@router.delete("/{usuario_id}", status_code=204)
def deletar_usuario(usuario_id: int, db:Session = Depends(get_db), usuario_atual: Usuario = Depends(admin_obrigatorio)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario não encontrado.")
    db.delete(usuario)
    db.commit()