from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.auth import verificar_senha, criar_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    usuario = db.query(Usuario).filter(Usuario.email == form.username).first()

    if not usuario or not verificar_senha(form.password, usuario.senha):
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos."
        )


    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo."
        )
    
    token = criar_token({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}
