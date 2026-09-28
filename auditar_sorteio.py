"""Verificador independente dos sorteios eletrônicos do IF Baiano.

Reimplementa em Python, sem depender do navegador, as duas versões do algoritmo
IFBSort usadas pelo index.html, para que qualquer pessoa possa conferir uma ata.

Uso:
    python auditar_sorteio.py <semente> <total_de_inscritos> [vagas]

Exemplos:
    python auditar_sorteio.py 1783948576102 150 40
    python auditar_sorteio.py v2-3f9a1c0b7e24d568 150 40

Sementes iniciadas por "v2-" usam a versão 2; qualquer outra semente usa a versão 1.
"""
import hashlib
import math
import re
import sys

M = 2147483647  # 2^31 - 1


def _int32(x):
    """Reduz um inteiro a 32 bits com sinal, como os operadores bit a bit do JavaScript."""
    x &= 0xFFFFFFFF
    return x - 0x100000000 if x >= 0x80000000 else x


def _hash_string_v1(texto):
    """DJB2 da v1, percorrendo unidades UTF-16 como String.charCodeAt do JavaScript."""
    h = 5381
    dados = texto.encode("utf-16-le")
    for k in range(0, len(dados), 2):
        codigo = dados[k] | (dados[k + 1] << 8)
        h = _int32(_int32(h << 5) + h + codigo)
    return h


def _ler_semente_v1(texto):
    """Mesma regra do parseInt(texto, 10) do JavaScript: número inicial, senão texto."""
    m = re.match(r"\s*([+-]?\d+)", texto)
    return float(int(m.group(1))) if m else texto


def sortear_v1(total, texto_semente):
    semente = _ler_semente_v1(texto_semente)
    estado = _hash_string_v1(semente) if isinstance(semente, str) else semente
    estado = math.fmod(abs(estado), M)
    if estado <= 0:
        estado = 1
    estado = int(estado)
    lista = list(range(1, total + 1))
    for i in range(total - 1, 0, -1):
        estado = (estado * 48271) % M
        r = (estado - 1) / (M - 1)
        j = math.floor(r * (i + 1))
        lista[i], lista[j] = lista[j], lista[i]
    return lista


def sortear_v2(total, texto_semente):
    semente = "v2-" + texto_semente.strip()[3:]
    lista = list(range(1, total + 1))
    for i in range(total - 1, 0, -1):
        h = hashlib.sha256(f"{semente}:{i}".encode("utf-8")).digest()
        j = int.from_bytes(h[:8], "big") % (i + 1)
        lista[i], lista[j] = lista[j], lista[i]
    return lista


def sortear(total, texto_semente):
    texto = texto_semente.strip()
    if texto.lower().startswith("v2-"):
        return "IFBSort v2 (SHA-256/Fisher-Yates)", sortear_v2(total, texto)
    return "IFBSort v1 (LCG Park-Miller/Fisher-Yates)", sortear_v1(total, texto)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    semente, total = sys.argv[1], int(sys.argv[2])
    vagas = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    versao, lista = sortear(total, semente)
    print(f"Semente: {semente.strip()}")
    print(f"Algoritmo: {versao}")
    print(f"Total de candidatos: {total} | Vagas: {vagas}")
    print("=" * 40)
    for pos, numero in enumerate(lista, start=1):
        status = "SELECIONADO" if pos <= vagas else "LISTA DE ESPERA"
        print(f"{pos}º colocado: Candidato número {numero} [{status}]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
