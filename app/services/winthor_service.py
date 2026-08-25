import oracledb
from app.config import settings

oracledb.init_oracle_client(lib_dir="/opt/oracle/instantclient_19_24")

def buscar_funcionarios(nome: str):
    conexao = oracledb.connect(
        user=settings.oracle_user,
        password=settings.oracle_password,
        dsn=settings.oracle_dsn
    )

    cursor = conexao.cursor()
    cursor.execute(
        "SELECT P.MATRICULA, P.NOME, P.CODSETOR, P.CODFILIAL FROM PCEMPR P WHERE P.SITUACAO = 'A' AND UPPER(P.NOME) LIKE UPPER(:nome)",
        {"nome": f"%{nome}%"}
    )
    resultados = []
    for row in cursor:
        resultados.append({
            "codigo": row[0],
            "nome": row[1],
            "cod_setor": row[2],
            "cod_filial": row[3],
        })
    cursor.close()
    conexao.close()
    return resultados