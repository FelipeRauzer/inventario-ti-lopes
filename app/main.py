from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import ativos, termos, movimentacao

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.project_name,
    version=settings.api_version,
    description="Sistema de controle e gestão de ativos de TI da Lopes Distribuidora",
)

# Permite o frontend acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ativos.router)
app.include_router(termos.router)
app.include_router(movimentacao.router)

@app.get("/", tags=["Root"])
def root():
    return {
        "projeto": settings.project_name,
        "versao": settings.api_version,
        "docs": "/docs",
    }