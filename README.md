# Sorteio Eletrônico Público — IF Baiano

Esta é uma aplicação web moderna (Single Page Application - SPA) desenvolvida para o **Instituto Federal de Educação, Ciência e Tecnologia Baiano (IF Baiano)**. Ela serve como ferramenta oficial para a realização de sorteios públicos de vagas (como em processos seletivos e certames) e auditoria pública e transparente de resultados através de sementes pseudo-aleatórias (*seeds*).

A aplicação foi projetada para ser hospedada diretamente no **GitHub Pages**, funcionando de forma 100% estática e offline após o carregamento inicial.

## 🌟 Funcionalidades Principais

*   **Realização de Sorteios:**
    *   Entrada simplificada de dados (Nome do Curso/Edital, quantidade de vagas).
    *   Suporte a dois modos de entrada de candidatos: apenas quantidade (gera números de 1 a N) ou colagem de lista de nomes/inscrições (um por linha).
    *   Geração automática de semente (*seed*) baseada no timestamp Unix do momento do sorteio (13 dígitos de milissegundos), garantindo aleatoriedade real na inicialização.
    *   Opção de inserção manual de semente para reaplicação ou auditoria controlada.
    *   Efeito visual dinâmico de embaralhamento (*micro-animations*) e feedback visual da distribuição de vagas da 1ª chamada e lista de espera.
    *   Ferramentas integradas para cópia do resultado em texto formatado para atas, exportação em formato `.csv` (compatível com Excel) e impressão direta da ata de sorteio formatada com espaços para assinatura de testemunhas.
*   **Auditoria Pública de Sementes (Transparência):**
    *   Painel dedicado para candidatos, órgãos de controle e cidadãos auditarem qualquer sorteio já realizado.
    *   Garantia de 100% de paridade lógica e auditoria transparente por meio de algoritmo matemático próprio documentado.
    *   **Ferramenta de Confronto Automático:** Permite colar uma lista de números/candidatos oficiais e confrontá-la em tempo real com a lista auditada gerada pela semente, apontando acertos e destacando divergências de ordenação em vermelho.
*   **Acessibilidade (A11y & WCAG):**
    *   Barra de acessibilidade superior para ajuste dinâmico do tamanho das fontes (A+ / A-).
    *   Modo de Alto Contraste com paleta de cores adaptada e preferência persistida via `localStorage`.
    *   Semântica HTML e suporte completo a leitores de tela.
*   **Design Responsivo & Premium:**
    *   Estética elegante e limpa baseada na marca do IF Baiano (Verde `#3E9A2D` e Vermelho `#C80710`).
    *   Mobile-First: 100% adaptado para visualização em smartphones na vertical, tablets, laptops e computadores de mesa.

## 🧮 Funcionamento do Algoritmo IFBSort

A nova lógica de sorteio do IF Baiano (**IFBSort**) foi projetada para ser totalmente independente de bibliotecas externas, sendo determinística e de simples replicação em qualquer linguagem de programação. O fluxo consiste em duas etapas matemáticas:

1.  **Gerador de Números Pseudo-Aleatórios (PRNG):**
    *   Implementa um **Gerador Congruente Linear (LCG) de Park-Miller** de 32-bits (multiplicador $a = 48271$, módulo $m = 2147483647$).
    *   Caso a semente informada seja alfanumérica (texto), ela é convertida para um valor numérico de 32 bits através do algoritmo de hash **DJB2** (`hash = ((hash << 5) + hash) + charCode`).
    *   Este gerador retorna valores consistentes no intervalo $[0, 1)$ a cada chamada de `prng.next()`.
2.  **Embaralhamento (Fisher-Yates / Knuth Shuffle):**
    *   O algoritmo percorre a lista de candidatos do final ao início, sorteando uma posição aleatória baseada no PRNG semeado: `j = Math.floor(prng.next() * (i + 1))`.
    *   Os elementos nas posições $i$ e $j$ são permutados.
    *   Este processo elimina vieses estatísticos de classificação, distribuindo as probabilidades de forma perfeitamente uniforme.

## 📖 Guia de Uso (Como Usar)

### Para Organizadores: Como Realizar um Sorteio
1.  **Acesse a Aplicação:** Abra a página da aplicação no navegador (seja a versão hospedada no GitHub Pages ou abrindo o arquivo `index.html` localmente).
2.  **Defina a Identificação:** No campo **Nome do Curso / Edital / Certame**, digite a identificação do sorteio (ex: *Técnico em Agropecuária - Edital 10/2026*).
3.  **Escolha o Modo de Entrada:**
    *   *Apenas Quantidade:* Digite apenas o número total de candidatos inscritos se deseja trabalhar com os números de inscrição sequenciais de $1$ a $N$.
    *   *Lista de Nomes:* Cole a lista de nomes dos candidatos, um por linha. O sistema associará automaticamente o número de linha a cada candidato.
4.  **Defina as Vagas:** Informe a quantidade de vagas imediatas disponíveis. Os candidatos restantes serão alocados ordenadamente na lista de espera. Caso defina `0` vagas, todos os candidatos serão classificados diretamente na lista de espera.
5.  **Configure a Semente (Seed):**
    *   Deixe desmarcado para gerar uma semente única e aleatória baseada no horário exato do clique (Recomendado para sorteios oficiais).
    *   Marque "Definir semente manualmente" apenas se estiver reaplicando um sorteio antigo ou realizando um teste controlado.
6.  **Execute o Sorteio:** Clique em **"Realizar Sorteio Público"**. Uma animação simulará o embaralhamento e exibirá o resultado na coluna da direita.
7.  **Salve os Documentos:**
    *   Use o botão **"Copiar Texto"** para obter a classificação estruturada em formato de texto para colagem rápida em relatórios ou editais.
    *   Use o botão **"Exportar CSV"** para baixar a planilha editável do resultado.
    *   Use o botão **"Imprimir Ata"** para abrir o assistente de impressão do navegador, gerando a ata física com cabeçalho oficial e seções para coleta de assinatura física das testemunhas e servidores.
8.  **Divulgação Obrigatória:** Ao publicar o resultado final no portal institucional, **é obrigatório divulgar a semente numérica ou de texto gerada pelo sistema** junto com o link da aplicação. Isso assegura que qualquer cidadão possa comprovar a integridade e lisura do processo.

### Para Candidatos e Auditores: Como Auditar um Sorteio
1.  **Localize as Informações no Edital:** Localize no edital de resultado do sorteio publicado no portal do IF Baiano:
    *   A **Semente (Seed)** oficial do sorteio.
    *   O **Total de Candidatos** inscritos.
    *   O **Número de Vagas** ofertadas.
2.  **Acesse a Aba de Auditoria:** Na aplicação web, clique no botão **"Auditar Sorteio (Transparência)"** localizado no topo.
3.  **Insira os Parâmetros:** Digite exatamente a mesma semente, o número total de candidatos e as vagas originais do edital.
4.  **Gere o Resultado da Auditoria:** Clique em **"Gerar Lista de Auditoria"**. O sistema reconstruirá a classificação idêntica usando o mesmo motor de semente histórico.
5.  **Use o Confrontador Automático:**
    *   Copie a coluna com a classificação oficial do documento em PDF publicado.
    *   Cole no campo **"Confrontar com o Resultado Publicado"**.
    *   O sistema analisará a sequência em tempo real e indicará o resultado:
        *   🟢 *CONFRONTO BATEU 100%!* — A lista publicada é autêntica e idêntica à gerada pela semente matemática.
        *   🔴 *DIVERGÊNCIA ENCONTRADA!* — Há alguma discrepância de posições. O sistema pintará de vermelho os candidatos com posições incompatíveis com a semente para análise técnica.

## 🚀 Como Hospedar no GitHub Pages

Para disponibilizar esta aplicação no GitHub para que qualquer pessoa possa acessá-la e realizar auditorias, siga os passos abaixo:

1.  Crie um novo repositório público no GitHub (ex: `sorteio-online-ifbaiano`).
2.  Envie os seguintes arquivos da raiz do projeto para o repositório:
    *   `index.html` (Aplicação)
    *   `styles.css` (Folha de Estilos)
    *   `marca-if-baiano-horizontal.png` (Logotipo)
3.  No GitHub, acesse a aba **Settings** (Configurações) do repositório.
4.  No menu lateral esquerdo, sob a seção "Code and automation", clique em **Pages**.
5.  Em **Build and deployment** > **Source**, selecione **Deploy from a branch**.
6.  Em **Branch**, selecione a branch principal (geralmente `main` ou `master`) e a pasta `/ (root)`.
7.  Clique em **Save**. 
8.  Em poucos minutos, o GitHub fornecerá o link público da aplicação (ex: `https://seu-usuario.github.io/sorteio-online-ifbaiano/`).

## 💻 Como Executar Localmente

Como a aplicação é construída com tecnologias web nativas sem necessidade de compilação, você pode rodá-la localmente de duas formas:
1.  **Abertura Direta:** Dê um duplo clique no arquivo `index.html` para abri-lo diretamente em seu navegador (Firefox, Chrome, Edge, Safari, etc.).
2.  **Servidor Local (Recomendado para testes):** Abra o terminal na pasta do projeto e execute um servidor simples:
    *   Em Python: `python -m http.server 8000` (acesse `http://localhost:8000`)
    *   Em Node.js/NPM: `npx serve` ou instale a extensão "Live Server" no VS Code.

## 📝 Log de Atualizações (Changelog)

*   **13/07/2026 (Atual):**
    *   Realce visual da semente de auditoria, tanto no painel do sistema (tamanho de fonte expandido, fonte mono, borda tracejada e cor de acento) quanto na ata de impressão oficial (bloco com borda preta fina, fundo cinza e texto ampliado para fácil leitura).
    *   Correção de bug na folha de estilos de impressão (`@media print`) e HTML que impedia a exibição do resultado e do bloco de assinaturas oficiais de testemunhas e servidores na ata impressa.
    *   Remoção do bloqueio que impedia sorteios com número de vagas maior que o número de inscritos (ex: 2 candidatos para 15 vagas), viabilizando certames com concorrência abaixo da oferta.
    *   Ajuste e polimento de textos institucionais no cabeçalho e na seção informativa de auditoria pública.
    *   Assinatura de desenvolvimento institucional da DiCom (Diretoria de Comunicação - IF Baiano) inserida no rodapé.
    *   Remoção do arquivo legado `seedrandom.js` do IFSC.
    *   Desenvolvimento do algoritmo próprio **IFBSort** (com LCG Park-Miller de 32 bits, hash de string DJB2 e Knuth-Shuffle/Fisher-Yates) para garantir independência absoluta de código de terceiros.
    *   Inclusão do guia de uso detalhado ("Como Usar") para organizadores e candidatos auditores no README.
    *   Estruturação inicial do projeto moderno para hospedagem no GitHub Pages.
    *   Criação do frontend responsivo e acessível (`index.html` e `styles.css`) usando a paleta de cores institucional do IF Baiano.
    *   Implementação do seletor dinâmico de acessibilidade (Alto Contraste e Zoom de Fontes).
    *   Implementação da entrada flexível de candidatos (por quantidade numérica ou colagem de lista de nomes/inscrições).
    *   Criação da ferramenta de confronto automático de listas na aba de auditoria, facilitando a identificação imediata de divergências.
