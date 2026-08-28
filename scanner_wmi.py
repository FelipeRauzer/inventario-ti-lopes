#!/usr/bin/env python3
"""
Scanner WMI — Inventário TI Lopes
Usa impacket-wmiexec pra coletar dados remotos de máquinas Windows.

Uso:
    python3 scanner_wmi.py                    # Scan completo
    python3 scanner_wmi.py --target 10.1.1.169  # Uma máquina só
    python3 scanner_wmi.py --rapido           # Só descobre hosts
    python3 scanner_wmi.py --cadastrar        # Cadastra na API
"""

import subprocess
import json
import socket
import xml.etree.ElementTree as ET
import argparse
import getpass
import requests

API_URL = "http://localhost:8000"


# ======================== NMAP ========================

def rodar_nmap(target: str, rapido: bool = False) -> str:
    print(f"\n🔍 Escaneando {target}...")
    if rapido:
        cmd = ["sudo", "nmap", "-sn", "-Pn", "-oX", "-", target]
    else:
        cmd = ["sudo", "nmap", "-p", "445", "-Pn", "--open", "-oX", "-", "--host-timeout", "10s", target]
    resultado = subprocess.run(cmd, capture_output=True, text=True)
    return resultado.stdout


def parsear_nmap(xml_output: str) -> list[dict]:
    dispositivos = []
    try:
        root = ET.fromstring(xml_output)
    except ET.ParseError:
        return []

    for host in root.findall('host'):
        status = host.find('status')
        if status is None or status.get('state') != 'up':
            continue

        d = {"ip": None, "hostname": None, "mac": None, "fabricante": None}

        for addr in host.findall('address'):
            t = addr.get('addrtype')
            if t == 'ipv4':
                d["ip"] = addr.get('addr')
            elif t == 'mac':
                d["mac"] = addr.get('addr')
                d["fabricante"] = addr.get('vendor', '')

        hostnames = host.find('hostnames')
        if hostnames is not None:
            for hn in hostnames.findall('hostname'):
                if hn.get('type') == 'PTR':
                    d["hostname"] = hn.get('name').split('.')[0]
                    break

        if not d["hostname"] and d["ip"]:
            try:
                d["hostname"] = socket.gethostbyaddr(d["ip"])[0].split('.')[0]
            except:
                pass

        if d["ip"]:
            dispositivos.append(d)

    return dispositivos


# ======================== WMI ========================

def extrair_dados_utf16(raw: bytes) -> dict:
    """
    O impacket-wmiexec retorna o header em ASCII e os dados em UTF-16-LE.
    Encontra onde começa o UTF-16 e decodifica só essa parte.
    """
    # Procura o início dos dados UTF-16 — começa após o lixo inicial
    # Os dados UTF-16 têm bytes nulos entre cada caractere: M\x00a\x00n\x00...
    # Encontra o primeiro campo conhecido: "Manufacturer=", "Name=", "Caption=" etc.
    # em UTF-16-LE cada char tem \x00 depois

    # Pega só a parte binária após o header ASCII do impacket
    # O header termina com o aviso de codec, depois vem \xef\xbf\xbd (replacement chars) e os dados
    idx = raw.find(b'\x00')
    if idx == -1:
        return {}

    # Recua um byte pra pegar o char completo
    if idx > 0:
        idx -= 1

    dados_brutos = raw[idx:]

    try:
        texto = dados_brutos.decode('utf-16-le', errors='ignore')
    except:
        return {}

    # Parseia CAMPO=valor
    resultado = {}
    for linha in texto.splitlines():
        linha = linha.strip().replace('\r', '').replace('\x00', '')
        if '=' not in linha:
            continue
        if any(x in linha for x in ['Impacket', 'Copyright', 'SMB', 'Decoding', 'codec', 'http']):
            continue
        partes = linha.split('=', 1)
        if len(partes) != 2:
            continue
        chave = partes[0].strip().lower()
        valor = partes[1].strip()
        if not chave:
            continue
        if chave in resultado:
            if isinstance(resultado[chave], list):
                resultado[chave].append(valor)
            else:
                resultado[chave] = [resultado[chave], valor]
        else:
            resultado[chave] = valor

    return resultado


def rodar_wmic_query(ip: str, usuario: str, senha: str, dominio: str, query: str) -> dict:
    """Roda um comando wmic remoto e retorna os dados parseados."""
    cmd = [
        "impacket-wmiexec",
        "-codec", "utf-8",
        f"{dominio}/{usuario}:{senha}@{ip}",
        f"chcp 65001 & {query}"
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, timeout=25)
        return extrair_dados_utf16(r.stdout)
    except subprocess.TimeoutExpired:
        return {}
    except Exception as e:
        return {}


def coletar_windows(ip: str, usuario: str, senha: str, dominio: str) -> dict:
    resultado = {"wmi_coletado": False}

    try:
        # Sistema
        s = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic computersystem get name,manufacturer,model,username /format:list")

        resultado["wmi_hostname"] = s.get("name", "").strip()
        fab = s.get("manufacturer", "").strip()
        fab = fab.replace("Micro-Star International Co., Ltd.", "MSI")
        resultado["wmi_fabricante"] = fab
        resultado["wmi_modelo"] = s.get("model", "").strip()
        u = s.get("username", "").strip()
        resultado["wmi_usuario"] = u.split("\\")[-1] if u and "\\" in u else (u or None)

        # Serial
        b = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic bios get serialnumber /format:list")
        resultado["wmi_serial"] = b.get("serialnumber", "").strip()

        # SO
        o = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic os get caption /format:list")
        resultado["wmi_so"] = o.get("caption", "").strip()

        # CPU
        c = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic cpu get name,numberofcores /format:list")
        nome_cpu = c.get("name", "").strip()
        cores = c.get("numberofcores", "").strip()
        resultado["wmi_cpu"] = f"{nome_cpu} ({cores} cores)" if cores else nome_cpu

        # RAM
        r = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic memorychip get capacity /format:list")
        caps = r.get("capacity", [])
        if isinstance(caps, str):
            caps = [caps]
        total_bytes = sum(int(c) for c in caps if str(c).isdigit())
        resultado["wmi_ram_gb"] = f"{round(total_bytes / (1024**3))} GB" if total_bytes else None

        # Disco
        d = rodar_wmic_query(ip, usuario, senha, dominio,
            "wmic diskdrive get size,mediatype /format:list")
        size = d.get("size", "0").strip()
        try:
            size_gb = round(int(size) / (1024**3))
            media = d.get("mediatype", "").lower()
            tipo = "SSD" if "ssd" in media or "solid" in media else "HD"
            resultado["wmi_disco"] = f"{size_gb} GB {tipo}"
        except:
            resultado["wmi_disco"] = None

        resultado["wmi_coletado"] = bool(resultado.get("wmi_hostname"))

    except Exception as e:
        resultado["wmi_erro"] = str(e)

    return resultado


# ======================== EXIBIÇÃO ========================

def exibir(d: dict, i: int):
    hostname = d.get("wmi_hostname") or d.get("hostname") or d["ip"]
    print(f"\n[{i}] {d['ip']} — {hostname}")

    if d.get("wmi_coletado"):
        print(f"     Fabricante : {d.get('wmi_fabricante') or 'N/A'}")
        print(f"     Modelo     : {d.get('wmi_modelo') or 'N/A'}")
        print(f"     Serial     : {d.get('wmi_serial') or 'N/A'}")
        print(f"     SO         : {d.get('wmi_so') or 'N/A'}")
        print(f"     CPU        : {d.get('wmi_cpu') or 'N/A'}")
        print(f"     RAM        : {d.get('wmi_ram_gb') or 'N/A'}")
        print(f"     Disco      : {d.get('wmi_disco') or 'N/A'}")
        print(f"     Usuário    : {d.get('wmi_usuario') or 'Nenhum logado'}")
    else:
        print(f"     ⚠️  WMI falhou: {d.get('wmi_erro', 'sem dados')}")
        print(f"     MAC        : {d.get('mac') or 'N/A'} ({d.get('fabricante') or 'N/A'})")


# ======================== API ========================

def cadastrar_na_api(dispositivos: list[dict], confirmar: bool = True):
    print(f"\n{'='*50}")
    print("  CADASTRANDO NA API")
    print(f"{'='*50}\n")

    cadastrados = erros = 0

    for d in dispositivos:
        hostname = d.get("wmi_hostname") or d.get("hostname") or d["ip"]

        if confirmar:
            resp = input(f"Cadastrar {d['ip']} ({hostname})? (s/n): ")
            if resp.lower() != 's':
                print("  ⏭️  Pulado")
                continue

        payload = {
            "hostname": hostname,
            "tipo": "DeskTop",
            "marca": d.get("wmi_fabricante") or d.get("fabricante") or "Desconhecida",
            "modelo": d.get("wmi_modelo") or "A identificar",
            "numero_serie": d.get("wmi_serial") or d.get("mac") or f"SCAN-{d['ip'].replace('.', '-')}",
            "ip": d["ip"],
            "status": "Ativo",
            "sistema_operacional": d.get("wmi_so"),
            "processador": d.get("wmi_cpu"),
            "ram_quantidade": d.get("wmi_ram_gb"),
            "armazenamento": d.get("wmi_disco"),
        }

        payload = {k: v for k, v in payload.items() if v}

        try:
            r = requests.post(f"{API_URL}/ativos/", json=payload)
            if r.status_code == 201:
                print(f"  ✅ {hostname} cadastrado (ID: {r.json()['id']})")
                cadastrados += 1
            elif r.status_code == 400 and "série" in r.json().get("detail", ""):
                print(f"  ⚠️  {hostname} já cadastrado")
            else:
                print(f"  ❌ Erro: {r.json().get('detail', r.status_code)}")
                erros += 1
        except Exception as e:
            print(f"  ❌ {e}")
            erros += 1

    print(f"\n✅ Cadastrados: {cadastrados} | ❌ Erros: {erros}")


# ======================== MAIN ========================

def main():
    parser = argparse.ArgumentParser(description="Scanner WMI — Inventário TI Lopes")
    parser.add_argument("--target", default="10.1.0.0/22")
    parser.add_argument("--rapido", action="store_true")
    parser.add_argument("--sem-wmi", action="store_true")
    parser.add_argument("--usuario", default="Administrator")
    parser.add_argument("--dominio", default="lopes.local")
    parser.add_argument("--cadastrar", action="store_true")
    parser.add_argument("--sem-confirmacao", action="store_true")
    parser.add_argument("--salvar", default="scan_resultado.json")
    args = parser.parse_args()

    print("🖥️  Scanner WMI — Inventário TI Lopes")
    print(f"   Target  : {args.target}")
    print(f"   Usuário : {args.dominio}\\{args.usuario}")

    senha = None
    if not args.sem_wmi and not args.rapido:
        senha = getpass.getpass(f"\nSenha ({args.dominio}\\{args.usuario}): ")

    # 1. Scan nmap
    xml = rodar_nmap(args.target, args.rapido)
    dispositivos = parsear_nmap(xml)

    if not dispositivos:
        print("❌ Nenhum host encontrado.")
        return

    print(f"📡 {len(dispositivos)} hosts encontrados.")

    # 2. Coleta WMI
    if not args.sem_wmi and not args.rapido and senha:
        for i, d in enumerate(dispositivos, 1):
            print(f"[{i}/{len(dispositivos)}] Coletando {d['ip']}...", end=" ", flush=True)
            info = coletar_windows(d["ip"], args.usuario, senha, args.dominio)
            d.update(info)
            print("✅" if d.get("wmi_coletado") else f"⚠️  {d.get('wmi_erro', 'Falha')}")

    # 3. Exibe
    print(f"\n{'='*50}")
    print("  RESULTADOS")
    print(f"{'='*50}")
    for i, d in enumerate(dispositivos, 1):
        exibir(d, i)

    # 4. Salva JSON
    with open(args.salvar, "w", encoding="utf-8") as f:
        json.dump(dispositivos, f, ensure_ascii=False, indent=2, default=str)
    print(f"\n💾 Salvo em: {args.salvar}")

    # 5. API
    if args.cadastrar:
        cadastrar_na_api(dispositivos, confirmar=not args.sem_confirmacao)
    else:
        resp = input("\nCadastrar na API? (s/n): ")
        if resp.lower() == 's':
            cadastrar_na_api(dispositivos)

    print("\n🎉 Concluído!")


if __name__ == "__main__":
    main()
