from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError,jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.config import settings


SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
TOKEN_EXPIRA_MINUTOS = 480

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha, senha_hash):
    return pwd_context.verify(senha, senha_hash)

def criar_token(dados: dict) -> str:
    payload = dados.copy()
    expira = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRA_MINUTOS)
    payload["exp"] = expira
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def login_obrigatorio(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    erro = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token Invalido ou expirado.", headers={"WWW-Authenticate": "Bearer"})

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise erro
    except JWTError:
        raise erro

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario or not usuario.ativo:
        raise erro
    return usuario

def admin_obrigatorio(usuario_atual: Usuario = Depends(login_obrigatorio)) -> Usuario:
    """Só permite acesso se o usuário for admin."""
    if not usuario_atual.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores."
        )
    return usuario_atual