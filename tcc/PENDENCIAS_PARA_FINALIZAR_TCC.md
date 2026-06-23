# PENDÊNCIAS PARA FINALIZAR O TCC — SeloPay

> Este arquivo lista todos os itens que precisam ser preenchidos, confirmados ou adicionados manualmente antes da entrega final do TCC.

---

## 1. DADOS CADASTRAIS (OBRIGATÓRIOS)

- [ ] **Nome completo do aluno** — substituir todos os `[NOME DO ALUNO]`
- [ ] **Nome da instituição de ensino** — substituir todos os `[NOME DA INSTITUIÇÃO]`
- [ ] **Nome do curso** — substituir todos os `[NOME DO CURSO]` (ex: Bacharelado em Ciência da Computação)
- [ ] **Nome do orientador(a)** — substituir todos os `[NOME DO ORIENTADOR]`
- [ ] **Cidade** — substituir todos os `[CIDADE]`
- [ ] **Ano** — substituir todos os `[ANO]`
- [ ] **Título acadêmico do aluno** — preencher na folha de rosto (Bacharel em Ciência da Computação / Sistemas de Informação / etc.)
- [ ] **Membros da banca examinadora** — preencher na folha de aprovação
- [ ] **Data de aprovação** — preencher após a defesa

---

## 2. REFERÊNCIAS BIBLIOGRÁFICAS

Todos os itens marcados como `[REFERÊNCIA A CONFIRMAR]` no arquivo `11_referencias.md` precisam ser verificados:

- [ ] **Westerman, Bonnet & McAfee (2014)** — confirmar editora, ISBN, páginas
- [ ] **Luhmann (2000)** — confirmar edição, editora e capítulo exato
- [ ] **Gefen & Straub (2004)** — confirmar volume, número e páginas na Omega
- [ ] **Mayer, Davis & Schoorman (1995)** — confirmar Academy of Management Review vol/n/páginas
- [ ] **Resnick et al. (2000)** — confirmar vol/n/páginas em Communications of the ACM
- [ ] **Dellarocas (2003)** — confirmar volume e número em Management Science
- [ ] **Hevner et al. (2004)** — confirmar páginas em MIS Quarterly
- [ ] **Nakasumi (2017)** — confirmar páginas e dados completos da conferência IEEE
- [ ] **Rubin & Sherlin** — identificar obra correta sobre credit scoring (pode ser autor diferente)
- [ ] **Swanson (2015)** — confirmar URL e dados completos do relatório R3CEV
- [ ] **BCB (2023)** — confirmar URL e nome exato do relatório de pagamentos
- [ ] **Adicionar datas de acesso** em todos os links da internet
- [ ] **Verificar formatação ABNT** (NBR 6023) de todas as referências conforme exigência da instituição

### Referências adicionais sugeridas (a pesquisar e adicionar):

- [ ] Artigo sobre sistemas de escrow digital em plataformas peer-to-peer
- [ ] Trabalho sobre gestão de identidade digital e KYC progressivo
- [ ] Referência sobre regulação de fintechs no Brasil (resolução BCB/CMN)
- [ ] Artigo sobre experiência do usuário em aplicativos financeiros
- [ ] Referência sobre LGPD e proteção de dados em sistemas de informação

---

## 3. FIGURAS E DIAGRAMAS (OBRIGATÓRIOS)

Os seguintes elementos visuais precisam ser criados e inseridos nos capítulos correspondentes:

- [ ] **Figura 1 — Tela de boas-vindas do SeloPay** (captura de tela)
- [ ] **Figura 2 — Tela de cadastro** (captura de tela)
- [ ] **Figura 3 — Tela Home com saldo** (captura de tela)
- [ ] **Figura 4 — Tela de criação de acordo** (captura de tela)
- [ ] **Figura 5 — Tela de detalhe do acordo ativo** (captura de tela)
- [ ] **Figura 6 — Tela de contestação** (captura de tela)
- [ ] **Figura 7 — Tela de score e reputação** (captura de tela)
- [ ] **Figura 8 — Tela de cartão virtual** (captura de tela)
- [ ] **Figura 9 — Tela de prova blockchain** (captura de tela)
- [ ] **Figura 10 — Painel admin — lista de disputas** (captura de tela)
- [ ] **Figura 11 — Diagrama de estados do acordo** (criar com Lucidchart, Draw.io ou similar — mostrar todos os estados e transições conforme os enums AgreementStatus e FinancialStatus)
- [ ] **Figura 12 — Diagrama de arquitetura geral** (criar — mostrar Mobile → API → PostgreSQL com setas de comunicação)
- [ ] **Figura 13 — Diagrama Entidade-Relacionamento (ER)** (gerar via Prisma Studio, DBeaver ou ferramenta de diagramação)
- [ ] **Telas adicionais no Apêndice G** (mínimo de 15-20 capturas diferentes)

### Como capturar telas do aplicativo:

1. Inicie o banco de dados: `docker compose up -d`
2. Inicie a API: `pnpm --filter api dev`
3. Inicie o mobile: `pnpm --filter mobile start`
4. Abra no simulador iOS/Android ou escaneie o QR Code com o Expo Go
5. Use `Ctrl+Shift+3` (Mac) ou `Ctrl+PrtSc` (Windows) para capturas
6. Certifique-se de que nenhum dado pessoal real está visível nas capturas

---

## 4. NORMAS E FORMATAÇÃO

- [ ] **Verificar normas ABNT específicas da instituição** — algumas instituições têm template próprio que difere da ABNT padrão
- [ ] **Paginação** — configurar corretamente: pré-textuais em algarismos romanos; textuais em arábicos a partir da introdução
- [ ] **Margens** — confirmar com a instituição (padrão ABNT: superior 3cm, esquerda 3cm, inferior 2cm, direita 2cm)
- [ ] **Fonte e espaçamento** — confirmar: fonte Times New Roman 12pt ou Arial 12pt; espaçamento 1,5; parágrafos com recuo 1,25cm
- [ ] **Títulos e subtítulos** — verificar formatação correta conforme NBR 6024
- [ ] **Citações longas** (mais de 3 linhas) — formatar com recuo 4cm, fonte 10pt, espaçamento simples, conforme NBR 10520
- [ ] **Numeração de tabelas e figuras** — verificar que estão numeradas sequencialmente e com legenda ABNT
- [ ] **Lista de siglas** — verificar se está completa com todas as siglas usadas no texto
- [ ] **Resumo e Abstract** — verificar se estão dentro do limite de palavras exigido pela instituição

---

## 5. REVISÃO DE CONTEÚDO

- [ ] **Revisão do orientador** — submeter todos os capítulos para revisão e ajustes conforme orientações
- [ ] **Revisão gramatical** — revisar todo o texto ou contratar revisor profissional
- [ ] **Consistência de nomenclatura** — verificar que termos técnicos (ex: "acordo", "disputa", "contestação") são usados de forma consistente ao longo do texto
- [ ] **Verificar se as citações estão corretas** — toda afirmação que não é de autoria própria precisa ter referência
- [ ] **Revisar as seções com [AGUARDA DIAGRAMA]** — inserir as figuras e atualizar o texto para referenciar corretamente as figuras inseridas
- [ ] **Atualizar a lista de figuras e a lista de tabelas** com números de página corretos
- [ ] **Atualizar o sumário** com os números de página corretos após a diagramação final

---

## 6. CONVERSÃO PARA FORMATO FINAL

- [ ] **Converter o markdown para Word (.docx) ou LaTeX** conforme exigência da instituição
  - Para Word: ferramentas como Pandoc podem converter Markdown → DOCX
  - Comando exemplo: `pandoc TCC_SELOPAY_COMPLETO.md -o TCC_SELOPAY.docx --reference-doc=modelo_tcc.docx`
  - Ajustar formatação manual após conversão (Pandoc nem sempre preserva 100% da formatação)
- [ ] **Inserir as figuras no documento Word/LaTeX** após a conversão
- [ ] **Gerar PDF final** conforme exigência da instituição
- [ ] **Verificar índice/sumário automático** no Word ou LaTeX após inserção de todas as figuras e ajustes

---

## 7. ENTREGA

- [ ] **Verificar prazo de entrega** junto à coordenação do curso
- [ ] **Verificar número de cópias** exigidas (versão impressa e/ou digital)
- [ ] **Verificar requisitos de encadernação** (espiral, capa dura, etc.)
- [ ] **Submeter o trabalho ao sistema da instituição** (Moodle, portal acadêmico, etc.) se aplicável
- [ ] **Preparar slides para a defesa** (geralmente 15-20 minutos de apresentação)

---

## 8. PONTOS A DISCUTIR COM O ORIENTADOR

- [ ] Se o título "SeloPay: Plataforma Digital para Registro e Garantia Simulada de Acordos entre Usuários" está adequado ou se o orientador sugere ajuste
- [ ] Se o volume atual do texto está dentro do esperado para o TCC da instituição (número de páginas por capítulo)
- [ ] Se há necessidade de incluir diagramas UML formais (casos de uso, sequência, classes) além dos fluxos descritos em texto
- [ ] Se o orientador quer revisar as referências bibliográficas antes da entrega
- [ ] Se há algum requisito específico de formatação da instituição não contemplado no template atual

---

> **Resumo executivo das pendências por prioridade:**
>
> 🔴 **Bloqueantes (sem esses o TCC não pode ser entregue):**
> Dados cadastrais do aluno, da instituição e do orientador; figuras/capturas de tela; formatação ABNT; aprovação do orientador.
>
> 🟡 **Importantes (afetam a qualidade acadêmica):**
> Confirmação das referências `[REFERÊNCIA A CONFIRMAR]`; diagramas (ER, estados, arquitetura); revisão gramatical.
>
> 🟢 **Desejáveis (melhoram a apresentação):**
> Figuras adicionais no Apêndice G; referências extras; ajustes finos de formatação.
