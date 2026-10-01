# Sorteio Eletrônico Público do IF Baiano

Ferramenta web, sem servidor, para realizar e auditar sorteios de vagas do IF Baiano. Funciona abrindo o `index.html` no navegador (ou pelo `EXECUTAR_SORTEIO_ONLINE.bat`) e não envia nenhum dado para fora do computador.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Interface com as abas "Realizar Sorteio" e "Auditar Sorteio". |
| `como-auditar.html` | Tutorial de auditoria em Linguagem Simples, com link na aba "Auditar Sorteio". |
| `motor-sorteio.js` | Motor de sorteio (versões 1 e 2) e leitura da lista colada no confronto. |
| `styles.css` | Estilos, modo de alto contraste e layout de impressão da ata. |
| `auditar_sorteio.py` | Verificador independente em Python, para conferir uma ata sem usar o navegador. |
| `harness.py` | Autoteste padrão do laboratório. |
| `favicon-if-baiano.ico`, `favicon-if-baiano.png` | Favicon oficial do IF Baiano, declarado no `<head>` do `index.html`. |
| `Software sorteio eletrônico/` | Ferramenta original do IFSC (2011), mantida como referência histórica. |

## Como o sorteio funciona

1. Antes do sorteio, publica-se a lista de inscritos com o número de cada candidato. No modo "Lista de Nomes", a ordem das linhas coladas define esse número, então ela precisa ser a mesma da lista publicada.
2. Ao clicar em "Realizar Sorteio Público", o sistema gera uma semente nova, no formato `v2-` seguido de 16 caracteres hexadecimais, com o gerador criptográfico do navegador. A semente não depende do horário e não pode ser digitada nessa aba.
3. A semente embaralha a lista inteira. Os primeiros colocados ocupam as vagas e os demais formam a lista de espera.
4. A ata (impressa, copiada ou exportada em CSV) traz a semente, o total de inscritos, as vagas e a versão do algoritmo.

## Versões do algoritmo

A versão é reconhecida pela própria semente, e por isso toda semente já publicada continua gerando o mesmo resultado.

| Semente | Versão | Algoritmo |
|---|---|---|
| Numérica, como `1783948576102` (sorteios anteriores a 28/09/2026) | IFBSort v1 | Park-Miller (MINSTD, a = 48271) e Fisher-Yates |
| Iniciada por `v2-`, como `v2-3f9a1c0b7e24d568` | IFBSort v2 | SHA-256 e Fisher-Yates |

**A v1 está congelada.** O código dela em `motor-sorteio.js` não pode ser alterado, nem mesmo a leitura da semente por `parseInt`, porque isso mudaria o resultado de sorteios já publicados. Ela foi substituída para sorteios novos porque, com sementes de horário, sementes próximas geravam resultados muito parecidos: em teste com 100 inscritos, o último colocado se repetiu em 997 de 1000 pares de sementes separadas por 1 milissegundo.

**Especificação da v2**, para reprodução em qualquer linguagem:

```
para i de N-1 até 1:
    h = SHA-256( UTF-8( semente + ":" + i ) )
    x = inteiro sem sinal de 64 bits dos 8 primeiros bytes de h (big-endian)
    j = x mod (i + 1)
    troca as posições i e j da lista [1, 2, ..., N]
```

O prefixo é normalizado (`V2-` equivale a `v2-`). O restante da semente é usado exatamente como publicado.

## Como auditar

**Pelo navegador:** na aba "Auditar Sorteio", informe a semente da ata, o total de inscritos e as vagas, e clique em "Gerar Lista de Auditoria". Para comparar automaticamente, cole no campo de confronto o texto da ata, o CSV exportado ou apenas os números de inscrição, em ordem de classificação.

**Pelo Python**, sem depender desta página:

```
python auditar_sorteio.py 1783948576102 150 40
python auditar_sorteio.py v2-3f9a1c0b7e24d568 150 40
```

O verificador em Python foi escrito a partir da especificação, sem reaproveitar o JavaScript, e confere com o navegador nas duas versões.

## Recomendações de uso

- Publicar a lista numerada de inscritos antes do sorteio.
- Realizar o sorteio uma única vez, em sessão pública ou gravada, e publicar a ata com a semente logo em seguida.
- Para eliminar de vez a escolha da semente pelo operador, uma evolução possível é derivá-la de um valor público anunciado antes, como o resultado de um concurso da Loteria Federal.

Desenvolvido pela DiCom, Diretoria de Comunicação do IF Baiano.

## Log de Atualizações

### 01/10/2026 (lista por arquivo e tutorial de auditoria)
- No modo "Lista de Nomes", novo botão "Carregar lista de um arquivo (.csv ou .txt)". O arquivo é lido só no navegador, nada é enviado nem salvo, e o campo de arquivo é limpo após a leitura. O arquivo apenas preenche a caixa de nomes, então o sorteio, a ata e o CSV exportado funcionam como antes.
- A leitura aceita UTF-8 (com ou sem BOM) e Windows-1252 (padrão do Excel em português), separadores ponto e vírgula, vírgula ou tabulação, e campos entre aspas. Com várias colunas, as células preenchidas são unidas por " - " (ex.: "2026014 - Nome").
- A primeira linha só é descartada como cabeçalho quando todas as células são títulos conhecidos (Nome, Inscrição, Curso, Campus etc.), para nunca descartar um candidato e deslocar a numeração. A mensagem informa a linha descartada e mostra os nº 1, nº 2 e o último para conferência com a lista publicada.
- Aviso quando o arquivo parece conter CPF, porque o conteúdo de cada linha aparece na ata pública. Limite de 5 MB por arquivo.
- Nova página `como-auditar.html`, com passo a passo, explicação de por que a auditoria mostra números e não nomes, significado de cada mensagem do confronto, o que fazer se o resultado não bater e conferência pelo `auditar_sorteio.py`. Link na aba de auditoria.
- `motor-sorteio.js` não foi alterado: resultados de sorteios já publicados continuam os mesmos.

### 01/10/2026
- Corrigido o favicon, que não carregava. O `index.html` não declarava nenhum ícone, e o `favicon.ico` da pasta era uma cópia em PNG do logo vertical com a extensão trocada. Copiados os favicons oficiais (`favicon-if-baiano.ico` e `favicon-if-baiano.png`, de `.agents/`) e declarados no `<head>`. Os arquivos antigos `favicon.ico` e `favicon.png` foram mantidos, mas não são mais usados.
