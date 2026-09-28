// motor-sorteio.js
// Motor de sorteio do IF Baiano, com duas versões convivendo:
//   v1 (IFBSort v1): Park-Miller + Fisher-Yates. CONGELADO. Não alterar nenhuma linha,
//      sob pena de quebrar a auditoria dos sorteios já publicados com semente numérica.
//   v2 (IFBSort v2): Fisher-Yates com sorteio de cada posição por SHA-256.
//      Sementes da v2 sempre começam com "v2-"; qualquer outra semente é v1.
//
// Especificação pública da v2 (reproduzível em qualquer linguagem):
//   Para i de N-1 até 1: h = SHA-256(UTF-8(semente + ":" + i));
//   x = inteiro sem sinal de 64 bits formado pelos 8 primeiros bytes de h (big-endian);
//   j = x mod (i + 1); troca as posições i e j.

// ===================== v1 (congelado) =====================

// Gerador Congruente Linear (LCG) de Park-Miller de 32-bits
class IFBaianoPRNG {
  constructor(seed) {
    // Converte a semente (número ou string) em um valor numérico de 32 bits
    this.state = typeof seed === 'number' ? seed : this.hashString(seed);
    // O estado inicial do LCG de Park-Miller deve ser positivo e diferente de zero
    this.state = Math.abs(this.state) % 2147483647;
    if (this.state <= 0) this.state = 1;
  }

  // Função de hash DJB2 modificada para converter strings de semente em inteiros consistentes
  hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Converte para inteiro de 32 bits assinado
    }
    return hash;
  }

  // Retorna o próximo valor pseudo-aleatório entre 0 (inclusivo) e 1 (exclusivo)
  next() {
    // Constantes padrões do LCG Park-Miller (MINSTD)
    const a = 48271;
    const m = 2147483647; // 2^31 - 1 (primo de Mersenne)
    this.state = (this.state * a) % m;
    return (this.state - 1) / (m - 1);
  }
}

// Algoritmo de Embaralhamento Moderno de Fisher-Yates (Knuth) do IF Baiano
function embaralharIFBaiano(candidatos, semente) {
  const prng = new IFBaianoPRNG(semente);
  const resultado = [...candidatos];

  for (let i = resultado.length - 1; i > 0; i--) {
    // Sorteia uma posição determinística de 0 a i
    const j = Math.floor(prng.next() * (i + 1));
    // Permuta os candidatos
    const temp = resultado[i];
    resultado[i] = resultado[j];
    resultado[j] = temp;
  }
  return resultado;
}

// Leitura da semente v1, idêntica à usada desde a primeira versão (inclusive o parseInt).
function lerSementeV1(texto) {
  const n = parseInt(texto, 10);
  return isNaN(n) ? texto : n;
}

// ===================== v2 =====================

const PREFIXO_V2 = 'v2-';

function ehSementeV2(texto) {
  return /^v2-/i.test(String(texto).trim());
}

// Normaliza só o prefixo (V2- vira v2-); o restante da semente é usado exatamente como publicado.
function normalizarSementeV2(texto) {
  const t = String(texto).trim();
  return PREFIXO_V2 + t.slice(3);
}

// Semente nova com 64 bits de entropia do gerador criptográfico do navegador.
// Não depende do horário, então não pode ser prevista nem ajustada pelo momento do clique.
function gerarSementeV2() {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return PREFIXO_V2 + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function embaralharIFBaianoV2(candidatos, semente) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Este navegador não oferece SHA-256 (crypto.subtle). Use Chrome, Edge ou Firefox atualizados.');
  }
  const s = normalizarSementeV2(semente);
  const enc = new TextEncoder();
  const n = candidatos.length;
  const indices = [];
  for (let i = n - 1; i > 0; i--) indices.push(i);
  const hashes = await Promise.all(indices.map(i =>
    globalThis.crypto.subtle.digest('SHA-256', enc.encode(s + ':' + i))));

  const resultado = [...candidatos];
  indices.forEach((i, k) => {
    const x = new DataView(hashes[k]).getBigUint64(0, false);
    const j = Number(x % BigInt(i + 1));
    const temp = resultado[i];
    resultado[i] = resultado[j];
    resultado[j] = temp;
  });
  return resultado;
}

// ===================== Ponto de entrada único =====================

// Decide a versão pela própria semente e devolve { versao, semente, lista }.
async function sortearPorSemente(candidatos, textoSemente) {
  const texto = String(textoSemente).trim();
  if (ehSementeV2(texto)) {
    const semente = normalizarSementeV2(texto);
    return { versao: 'IFBSort v2 (SHA-256/Fisher-Yates)', semente, lista: await embaralharIFBaianoV2(candidatos, semente) };
  }
  const semente = lerSementeV1(texto);
  return { versao: 'IFBSort v1 (LCG Park-Miller/Fisher-Yates)', semente, lista: embaralharIFBaiano(candidatos, semente) };
}

// ===================== Leitura da lista colada no confronto =====================

// Extrai, em ordem de classificação, os números de inscrição de um texto colado.
// Aceita o texto da ata ("1º - Nome (Inscrição: 14)"), o texto da auditoria
// ("1º colocado: Candidato número 14"), o CSV exportado, a lista da ferramenta antiga
// do IFSC ("14     (1º)") e números soltos separados por espaço, vírgula ou linha.
// Posições como "1º" são descartadas para não se misturarem aos números de inscrição.
function extrairNumerosConfronto(texto) {
  const numeros = [];
  String(texto).split(/\r?\n/).forEach(bruta => {
    const linha = bruta.trim();
    if (!linha) return;

    const inscricao = linha.match(/Inscri[cç][aã]o:\s*(\d+)/i);
    if (inscricao) { numeros.push(parseInt(inscricao[1], 10)); return; }

    const candidato = linha.match(/Candidato\s+n(?:[úu]mero|º|°|o\.?)\s*(\d+)/i);
    if (candidato) { numeros.push(parseInt(candidato[1], 10)); return; }

    if (linha.includes(';')) {
      const campos = linha.split(';');
      if (campos.length >= 3 && /^\d+$/.test(campos[2].trim())) numeros.push(parseInt(campos[2], 10));
      return;
    }

    // Linhas de cabeçalho da ata (Semente: ..., Total de Candidatos: ...) não entram na lista
    if (linha.includes(':')) return;

    const semPosicoes = linha.replace(/\d+\s*[ºª°]/g, ' ');
    (semPosicoes.match(/\d+/g) || []).forEach(n => numeros.push(parseInt(n, 10)));
  });
  // Numa lista sorteada nenhum número se repete; repetição colada em sequência vem da cópia da tela.
  return numeros.filter((n, i) => i === 0 || n !== numeros[i - 1]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IFBaianoPRNG, embaralharIFBaiano, lerSementeV1, ehSementeV2, normalizarSementeV2,
    gerarSementeV2, embaralharIFBaianoV2, sortearPorSemente, extrairNumerosConfronto };
}
