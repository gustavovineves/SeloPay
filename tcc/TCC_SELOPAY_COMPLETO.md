# SELOPAY: PLATAFORMA DIGITAL PARA REGISTRO E GARANTIA SIMULADA DE ACORDOS ENTRE USUÁRIOS

> **Trabalho de Conclusão de Curso**
> [NOME DO ALUNO]
> [NOME DA INSTITUIÇÃO] — [NOME DO CURSO]
> Orientador(a): [NOME DO ORIENTADOR]
> [CIDADE], [ANO]

---

# ELEMENTOS PRÉ-TEXTUAIS

## CAPA

```
[NOME DA INSTITUIÇÃO]
[NOME DO CURSO]

[NOME DO ALUNO]

SELOPAY: PLATAFORMA DIGITAL PARA REGISTRO E GARANTIA SIMULADA
DE ACORDOS ENTRE USUÁRIOS

[CIDADE]
[ANO]
```

## FOLHA DE ROSTO

```
[NOME DO ALUNO]

SELOPAY: PLATAFORMA DIGITAL PARA REGISTRO E GARANTIA SIMULADA
DE ACORDOS ENTRE USUÁRIOS

Trabalho de Conclusão de Curso apresentado ao [NOME DO CURSO]
da [NOME DA INSTITUIÇÃO] como requisito parcial para obtenção
do título de [NOME DO TÍTULO].

Orientador(a): [NOME DO ORIENTADOR]

[CIDADE]
[ANO]
```

## RESUMO

O presente trabalho descreve o desenvolvimento do SeloPay, uma plataforma digital para criação, registro, acompanhamento e resolução de acordos entre usuários, implementada como Produto Mínimo Viável (MVP) no contexto de um Trabalho de Conclusão de Curso em Ciência da Computação. O problema abordado diz respeito à informalidade e fragilidade dos acordos cotidianos entre pessoas físicas — empréstimos, prestações de serviço, parcelamentos informais — que, na ausência de registro estruturado, frequentemente geram conflitos, inadimplência e perda de confiança. A solução proposta permite que dois usuários formalizem digitalmente um compromisso, acompanhem seu ciclo de vida por meio de uma máquina de estados bem definida, e disponham de mecanismos de garantia simulada de valores, dupla confirmação de cumprimento, contestação com envio de evidências e resolução manual por administrador. O sistema foi desenvolvido sobre uma arquitetura de monorepo com dois aplicativos principais: uma API REST construída com NestJS e TypeScript, sustentada por banco de dados PostgreSQL via Prisma ORM, e um aplicativo mobile multiplataforma desenvolvido com Expo e React Native. Complementarmente, o SeloPay incorpora um sistema de reputação baseado em score comportamental, um cartão virtual com limite calculado dinamicamente conforme o score do usuário, depósito de garantia via Pix simulado, carteira interna com saldo disponível e bloqueado, e um registro encadeado de eventos por meio de hashes SHA256 — referenciado no projeto como blockchain interno simulado. Todos os componentes financeiros são simulados para fins acadêmicos, sem integração com o sistema Pix real, sem custódia de valores reais e sem vínculo com instituições financeiras. Os resultados demonstram que o MVP atende ao objetivo central de formalizar e acompanhar acordos digitais, validando a viabilidade técnica da proposta e identificando limitações a serem superadas em trabalhos futuros.

**Palavras-chave:** acordos digitais; confiança digital; garantia simulada; dupla confirmação; reputação; score; NestJS; React Native; MVP; Produto Mínimo Viável.

## ABSTRACT

This work describes the development of SeloPay, a digital platform for the creation, registration, tracking, and resolution of agreements between users, implemented as a Minimum Viable Product (MVP) within the scope of an undergraduate thesis in Computer Science. The problem addressed concerns the informality and fragility of everyday agreements between individuals — loans, service contracts, informal installment payments — which, in the absence of structured records, frequently generate disputes, default, and loss of trust. The proposed solution enables two users to digitally formalize a commitment, monitor its lifecycle through a well-defined state machine, and make use of simulated value guarantee mechanisms, dual confirmation of fulfillment, dispute filing with evidence submission, and manual resolution by an administrator. The system was built on a monorepo architecture with two main applications: a REST API constructed with NestJS and TypeScript, backed by a PostgreSQL database via Prisma ORM, and a cross-platform mobile application developed with Expo and React Native. In addition, SeloPay incorporates a behavioral score-based reputation system, a virtual credit card with a dynamically calculated limit based on the user's score, simulated Pix deposit, an internal wallet with available and blocked balances, and a chained event record using SHA256 hashes — referenced in the project as a simulated internal blockchain. All financial components are simulated for academic purposes, with no integration with the real Pix system, no real value custody, and no ties to financial institutions. The results demonstrate that the MVP meets the central objective of formalizing and monitoring digital agreements, validating the technical feasibility of the proposal and identifying limitations to be addressed in future work.

**Keywords:** digital agreements; digital trust; simulated guarantee; dual confirmation; reputation; score; NestJS; React Native; MVP; Minimum Viable Product.

---

# CAPÍTULO 1 — INTRODUÇÃO

## 1.1 Contextualização

Na vida cotidiana, pessoas estabelecem constantemente compromissos financeiros e de serviço entre si: empréstimos a amigos e familiares, combinados de pagamento por serviços prestados de forma autônoma, acordos de parcelamento informal, promessas de entrega de produto, aluguel entre conhecidos e inúmeras outras situações nas quais o compromisso existe, mas a formalização não ocorre. Segundo dados do Banco Central do Brasil, o Brasil registrou, em 2022, mais de 100 bilhões de chaves Pix ativas e uma média de 90 milhões de transações por dia (BCB, 2023), evidenciando uma sociedade altamente digitalizada em termos de movimentação financeira. Contudo, a informalidade que antecede ou acompanha esses pagamentos — o acordo em si — permanece essencialmente não estruturada.

A ausência de registro formal em acordos informais cria um ambiente de vulnerabilidade mútua. O pagador que antecipa o valor de um serviço não tem garantia de que o serviço será prestado. O prestador de serviço que entrega antes de receber o pagamento não tem como comprovar o que foi acordado. Em caso de disputa, a única evidência disponível é a memória das partes ou, quando muito, uma conversa de aplicativo de mensagens — registro informal, passível de exclusão e sem valor jurídico consolidado.

Plataformas digitais têm buscado mitigar esse problema em diferentes frentes. Marketplaces de serviços, aplicativos de pagamento, contratos digitais e plataformas de reputação representam iniciativas parciais. No entanto, nenhuma delas resolve integralmente o problema do acordo informal entre pessoas físicas sem vínculo comercial formal, especialmente quando o valor envolvido é pequeno, o relacionamento é pessoal e a contratação de serviços jurídicos seria desproporcionalmente custosa.

O presente trabalho propõe e descreve o desenvolvimento do SeloPay, uma plataforma digital voltada à formalização, acompanhamento e garantia simulada de acordos entre usuários. O sistema permite que duas pessoas registrem digitalmente um compromisso, acompanhem seu ciclo de vida por meio de uma aplicação mobile, e disponham de mecanismos de proteção como depósito simulado de garantia, confirmação mútua de cumprimento e resolução estruturada de disputas com análise administrativa.

O SeloPay foi concebido e desenvolvido como Produto Mínimo Viável (MVP) no contexto acadêmico de um Trabalho de Conclusão de Curso, utilizando tecnologias modernas de desenvolvimento de software: NestJS para a API REST, PostgreSQL como banco de dados relacional, Prisma como ORM, e Expo com React Native para o aplicativo mobile. Nenhuma operação financeira real é executada pelo sistema — todos os mecanismos de pagamento e garantia são simulados para fins de demonstração.

## 1.2 Problema de Pesquisa

A problemática que motiva este trabalho pode ser formulada da seguinte maneira:

> *Como um sistema digital pode auxiliar na formalização, acompanhamento e aumento da confiança em acordos informais entre usuários, utilizando mecanismos de registro estruturado, garantia simulada de valores, dupla confirmação de cumprimento, resolução de disputas e sistema de reputação baseado em comportamento?*

## 1.3 Objetivo Geral

Desenvolver um Produto Mínimo Viável de uma plataforma digital denominada SeloPay, destinada à criação, registro, acompanhamento e garantia simulada de acordos entre usuários, com suporte a ciclo de vida completo do acordo, disputa estruturada e sistema de reputação comportamental.

## 1.4 Objetivos Específicos

Para alcançar o objetivo geral, foram estabelecidos os seguintes objetivos específicos:

a) Identificar e documentar os principais problemas e necessidades dos usuários que realizam acordos informais cotidianos;

b) Levantar e especificar os requisitos funcionais e não funcionais do sistema SeloPay;

c) Modelar as entidades de dados, os estados do sistema e os fluxos de negócio necessários à plataforma;

d) Desenvolver uma API REST modular com NestJS e TypeScript, suportada por banco de dados PostgreSQL e ORM Prisma;

e) Implementar o ciclo de vida completo de acordos digitais, incluindo criação, aceite, recusa, expiração, confirmação e cancelamento;

f) Implementar mecanismo de garantia simulada de valores com suporte a três fontes: carteira interna, Pix simulado e cartão virtual;

g) Implementar o mecanismo de dupla confirmação, pelo qual o valor protegido é liberado somente após o reconhecimento mútuo de cumprimento;

h) Implementar sistema de contestação de acordos com envio de evidências e resolução manual por administrador;

i) Implementar sistema de score de reputação baseado em eventos comportamentais do usuário;

j) Implementar cartão virtual com limite de crédito calculado dinamicamente com base no score do usuário;

k) Desenvolver aplicativo mobile multiplataforma com Expo e React Native, cobrindo os principais fluxos do sistema;

l) Documentar as limitações do MVP e propor melhorias para trabalhos futuros.

## 1.5 Justificativa

A relevância deste trabalho pode ser analisada sob três perspectivas: social, tecnológica e acadêmica.

**Perspectiva social:** O problema dos acordos informais não cumpridos afeta diretamente a qualidade das relações pessoais e econômicas de grande parte da população brasileira. A facilidade de combinar valores e serviços por aplicativos de mensagem não é acompanhada por uma infraestrutura de acompanhamento, prova ou resolução. A ausência de formalização contribui para ciclos de desconfiança que afetam, especialmente, trabalhadores autônomos, microempreendedores e pessoas em situação de vulnerabilidade econômica, que raramente têm acesso a mecanismos jurídicos formais de cobrança.

**Perspectiva tecnológica:** O desenvolvimento do SeloPay demonstra a aplicação prática de um conjunto expressivo de conceitos e tecnologias relevantes na indústria de software contemporânea: arquitetura modular com NestJS e injeção de dependência; modelagem de dados complexa com Prisma e PostgreSQL; gerenciamento de estados de ciclo de vida por máquina de estados; autenticação stateless com JWT em dois contextos separados; desenvolvimento mobile multiplataforma com React Native; e conceito de rastreabilidade encadeada de eventos inspirado em blockchain.

**Perspectiva acadêmica:** O TCC propõe uma solução original para um problema real e cotidiano, permitindo a aplicação integrada de conhecimentos de engenharia de software, banco de dados, segurança da informação, usabilidade e arquitetura de sistemas. A proposta dialoga com temas emergentes como confiança digital, economia da reputação, fintech e legaltech, oferecendo uma base para investigação e extensão em trabalhos futuros.

## 1.6 Delimitação do Projeto

Este trabalho delimita-se ao desenvolvimento de um MVP acadêmico, com as seguintes restrições explícitas:

- **Sem operação financeira real:** Nenhum valor monetário real é movimentado, depositado ou custodiado pelo sistema. Todas as operações de saldo, bloqueio e liberação são simulações internas ao banco de dados.
- **Sem integração com o Pix real:** O sistema implementa uma simulação do fluxo Pix para fins de demonstração, gerando QR Codes e códigos copia-e-cola falsos. Não há integração com o SPI do Banco Central do Brasil.
- **Sem verificação real de identidade (KYC):** O campo CPF é coletado apenas como dado cadastral.
- **Sem blockchain público:** O registro encadeado de eventos utiliza hashes SHA256 em banco de dados relacional, sem integração com redes distribuídas.
- **Sem cartão de crédito real:** O cartão virtual é um mecanismo interno de limite de crédito baseado em score.
- **Ambiente de desenvolvimento:** O sistema é executado em ambiente local com Docker para o banco de dados.

## 1.7 Organização do Trabalho

O presente trabalho está organizado em nove capítulos, além dos elementos pré-textuais e pós-textuais. O Capítulo 2 apresenta a fundamentação teórica. O Capítulo 3 descreve a metodologia. O Capítulo 4 apresenta a análise e especificação do sistema. O Capítulo 5 descreve o projeto e arquitetura da solução. O Capítulo 6 detalha o desenvolvimento do MVP. O Capítulo 7 apresenta os testes e validação. O Capítulo 8 discute os resultados. O Capítulo 9 apresenta as considerações finais.

---

# CAPÍTULO 2 — FUNDAMENTAÇÃO TEÓRICA

## 2.1 Transformação Digital e Formalização de Processos

A transformação digital pode ser compreendida como o processo pelo qual organizações e indivíduos utilizam tecnologias digitais para modificar e melhorar atividades, processos e modelos de interação previamente analógicos ou informais (WESTERMAN; BONNET; McAFEE, 2014 [REFERÊNCIA A CONFIRMAR]). Na perspectiva de sistemas de informação, esse processo envolve não apenas a automação de tarefas, mas a reconfiguração de fluxos de informação, papéis e responsabilidades.

No contexto de acordos interpessoais, a transformação digital representa a possibilidade de substituir ou complementar combinados verbais e registros em papel por documentos digitais estruturados, com data, partes identificadas, termos definidos e histórico rastreável. Essa transição não elimina a necessidade de confiança entre as partes, mas introduz mecanismos técnicos capazes de reduzir a dependência exclusiva de confiança interpessoal, substituindo-a parcialmente por confiança em sistemas (LUHMANN, 2000 [REFERÊNCIA A CONFIRMAR]).

A formalização digital de processos tem sido estudada especialmente no contexto de contratos inteligentes (*smart contracts*) e assinaturas digitais, mas também se aplica a contextos mais simples, como o registro e o acompanhamento de compromissos informais entre pessoas.

## 2.2 Confiança Digital em Plataformas

A confiança é um elemento central nas trocas econômicas. Segundo Mayer, Davis e Schoorman (1995 [REFERÊNCIA A CONFIRMAR]), a confiança pode ser definida como a disposição de uma parte em ser vulnerável às ações de outra, baseada na expectativa de que a outra parte realizará uma ação específica importante para quem confia, independentemente da capacidade de monitorar ou controlar essa outra parte.

Em plataformas digitais, mecanismos institucionais de garantia — como sistemas de reputação, avaliações de outros usuários, mecanismos de escrow e suporte de resolução de disputas — desempenham papel fundamental na construção de confiança entre estranhos (GEFEN; STRAUB, 2004 [REFERÊNCIA A CONFIRMAR]). Plataformas como eBay, Airbnb e mercados online validaram empiricamente que mecanismos de reputação e mediação de conflitos são determinantes para a adoção (RESNICK et al., 2000 [REFERÊNCIA A CONFIRMAR]).

## 2.3 Plataformas de Intermediação e Acordos Digitais

Parker, Van Alstyne e Choudary (2016 [REFERÊNCIA A CONFIRMAR]) definem plataformas digitais como sistemas que facilitam interações e trocas entre grupos de usuários, criando valor por meio da orquestração dessas trocas. No contexto do SeloPay, a plataforma funciona como intermediária de confiança digital entre pagador e recebedor, sem necessariamente ocupar a posição de parte em qualquer contrato jurídico.

Acordos digitais são documentos formalizados em suporte eletrônico que registram obrigações, prazos, partes e condições de cumprimento. O SeloPay não pretende substituir contratos juridicamente vinculantes, mas oferecer um registro digital informal que serve como evidência organizada do acordo, facilitando a resolução de conflitos por meio de um processo estruturado interno à plataforma.

## 2.4 Sistemas de Pagamento, Escrow e Garantia

Mecanismos de escrow (depósito em garantia) são amplamente utilizados em transações onde há assimetria de informação ou risco de não cumprimento por uma das partes. Em sua forma tradicional, o escrow envolve uma terceira parte neutra que retém o valor até que as condições pré-acordadas sejam verificadas e cumpridas (WILLIAMSON, 1985 [REFERÊNCIA A CONFIRMAR]).

O SeloPay implementa um conceito análogo ao escrow, porém inteiramente simulado: o valor não é real, mas o mecanismo de retenção, verificação e liberação espelha a lógica de um escrow digital. O sistema Pix, lançado pelo Banco Central do Brasil em novembro de 2020, é o sistema de pagamentos instantâneos mais adotado no país (BCB, 2020 [REFERÊNCIA A CONFIRMAR]). O SeloPay simula o fluxo de pagamento via Pix sem qualquer integração real com o SPI.

## 2.5 Reputação e Score em Sistemas Digitais

Sistemas de reputação têm sido amplamente estudados no contexto de plataformas de comércio eletrônico. Resnick e Varian (1997 [REFERÊNCIA A CONFIRMAR]) descreveram sistemas de feedback como mecanismos que permitem a construção de reputação em ambientes onde as partes não se conhecem previamente, incentivando o comportamento honesto por meio de consequências futuras visíveis.

Dellarocas (2003 [REFERÊNCIA A CONFIRMAR]) demonstrou que sistemas de reputação online são eficazes em reduzir o comportamento oportunista. No contexto de crédito, a ideia de pontuação numérica ao comportamento financeiro é central ao conceito de *credit score* (RUBIN; SHERLIN, 2008 [REFERÊNCIA A CONFIRMAR]).

O SeloPay incorpora uma versão simplificada e comportamental desse conceito, calculando um score com base nas ações do usuário dentro da própria plataforma. Seu score não tem valor financeiro ou legal fora do sistema — sua função é incentivar o cumprimento de acordos e determinar o limite do cartão virtual interno.

## 2.6 Blockchain e Rastreabilidade de Eventos

O conceito de blockchain foi introduzido por Nakamoto (2008 [REFERÊNCIA A CONFIRMAR]) como sistema de pagamentos eletrônicos ponto a ponto baseado em encadeamento criptográfico de blocos. Além de criptomoedas, o blockchain tem sido aplicado a rastreabilidade de cadeia de suprimentos, registro de documentos e contratos inteligentes (NAKASUMI, 2017 [REFERÊNCIA A CONFIRMAR]).

O SeloPay implementa um mecanismo inspirado nesse conceito, porém centralizado: um registro em PostgreSQL onde cada evento gera um hash SHA256 calculado a partir do hash do evento anterior concatenado com o tipo e o payload do evento atual. Swanson (2015 [REFERÊNCIA A CONFIRMAR]) distingue entre blockchain público e blockchain privado/permissionado, sendo que este último se assemelha mais ao modelo do SeloPay em termos de governança centralizada.

## 2.7 Produto Mínimo Viável

O conceito de Produto Mínimo Viável (MVP) foi popularizado por Ries (2011 [REFERÊNCIA A CONFIRMAR]) no contexto da metodologia Lean Startup. No contexto acadêmico, o MVP é um protótipo funcional que implementa os casos de uso mais representativos com profundidade técnica suficiente para demonstrar a viabilidade da arquitetura.

Beck et al. (2001 [REFERÊNCIA A CONFIRMAR]), no Manifesto Ágil, propõem que "software funcionando é a medida primária de progresso". Sommerville (2011 [REFERÊNCIA A CONFIRMAR]) contextualiza o desenvolvimento de protótipos como etapa essencial no processo de engenharia de requisitos, especialmente em sistemas com alto grau de interação com usuários finais.

---

# CAPÍTULO 3 — METODOLOGIA

## 3.1 Tipo de Pesquisa

Este trabalho se enquadra como pesquisa aplicada, de natureza exploratória e abordagem qualitativa, orientada pelo desenvolvimento de artefato tecnológico. O método adotado é o Design Science Research (DSR), proposto por Hevner et al. (2004 [REFERÊNCIA A CONFIRMAR]), que orienta a pesquisa em sistemas de informação como um processo de criação e avaliação de artefatos que solucionam problemas organizacionais ou sociais identificados. O SeloPay é o artefato principal produzido por este trabalho.

## 3.2 Procedimentos Metodológicos

O desenvolvimento do SeloPay seguiu as seguintes etapas: (1) Identificação e análise do problema; (2) Levantamento de requisitos; (3) Modelagem do sistema; (4) Definição da arquitetura; (5) Implementação iterativa; (6) Testes manuais e validação; (7) Documentação.

## 3.3 Tecnologias Utilizadas

A escolha das tecnologias foi orientada por critérios de adequação ao problema, maturidade, adoção na indústria e sinergia entre as ferramentas.

**Tabela 1 — Tecnologias utilizadas no projeto**

| Tecnologia | Versão | Função no Projeto |
|------------|--------|-------------------|
| TypeScript | 5.3 / 5.9 | Linguagem principal — tipagem estática |
| Node.js | ≥ 18 | Runtime do servidor |
| NestJS | 10.3.0 | Framework backend modular |
| Prisma | 5.9.1 | ORM type-safe com migrations |
| PostgreSQL | 16 | Banco de dados relacional |
| Docker / Docker Compose | — | Containerização do banco |
| pnpm | 8+ | Gerenciador de pacotes e workspaces |
| Expo | 54.0.35 | Plataforma de desenvolvimento mobile |
| React Native | 0.81.5 | Framework de aplicativo mobile |
| React | 19.1.0 | Biblioteca de componentes |
| Expo Router | 6.0.24 | Roteamento file-based para mobile |
| Axios | 1.7.7 | Cliente HTTP com interceptores |
| bcryptjs | 2.4.3 | Hash seguro de senhas |
| class-validator | 0.14.1 | Validação de DTOs |
| @nestjs/swagger | 7.2.0 | Documentação automática OpenAPI |
| multer | 2.2.0 | Upload de arquivos |
| @nestjs/throttler | 5.1.1 | Rate limiting (60 req/min) |

**NestJS** foi escolhido por sua arquitetura modular com suporte nativo a injeção de dependência, decorators TypeScript e geração automática de documentação Swagger. **Prisma** foi adotado por oferecer tipagem estática completa das operações de banco de dados e suporte a migrations versionadas. **Expo e React Native** foram escolhidos para desenvolver aplicativos iOS e Android a partir de uma única base de código.

## 3.4 Ambiente de Desenvolvimento

O projeto é organizado como um **monorepo pnpm** com dois aplicativos em `apps/api` (NestJS, porta 3333) e `apps/mobile` (Expo). O PostgreSQL 16 é executado via Docker Compose na porta 5435. A API disponibiliza documentação Swagger em `http://localhost:3333/docs`. O banco conta com scripts de seed (dados demo) e reset (restauração ao estado inicial).

## 3.5 Critérios de Validação

A validação foi realizada de forma manual por quatro frentes: (1) **Swagger UI** para teste direto de endpoints; (2) **Aplicativo mobile** para teste de fluxos completos; (3) **Verificação no banco** de dados para confirmar integridade de transações atômicas; (4) **TypeScript typecheck** (`tsc --noEmit`) retornando 0 erros em ambos os projetos.

---

# CAPÍTULO 4 — ANÁLISE E ESPECIFICAÇÃO DO SISTEMA

## 4.1 Visão Geral do SeloPay

O SeloPay é uma plataforma digital que permite a dois usuários formalizarem, acompanharem e resolverem acordos de forma estruturada. O sistema funciona como intermediário de confiança digital: não é parte no acordo, não tem papel jurídico, mas oferece a infraestrutura técnica para que o acordo seja registrado, monitorado e, em caso de não cumprimento, contestado por meio de um processo interno.

O ciclo de vida de um acordo percorre os seguintes estágios: **criação** pelo pagador, **aceite ou recusa** pelo recebedor, **depósito simulado de garantia** pelo pagador, **confirmação mútua de cumprimento**, **contestação** (quando há divergência) e **resolução** — seja pela confirmação das duas partes ou pela decisão do administrador em caso de disputa.

## 4.2 Atores do Sistema

O SeloPay reconhece três atores: **Usuário Pagador** (cria o acordo, deposita a garantia, confirma o cumprimento), **Usuário Recebedor** (aceita ou recusa, confirma o recebimento, pode contestar) e **Administrador** (analisa disputas e registra decisões via painel com autenticação separada).

## 4.3 Requisitos Funcionais

> Ver tabela completa no Apêndice A.

Os 35 requisitos funcionais cobrem: cadastro e autenticação (RF01–RF05), gestão de acordos (RF06–RF17), disputas (RF17–RF23), reputação (RF24–RF25), cartão virtual (RF26), blockchain (RF27), carteira e Pix (RF28–RF29), renegociação (RF30–RF31), prova blockchain (RF32), privacidade (RF33), notificações (RF34) e dashboard admin (RF35).

## 4.4 Requisitos Não Funcionais

> Ver tabela completa no Apêndice B.

Os 20 requisitos não funcionais cobrem: segurança (RNF01–RNF04), validação (RNF05), transações atômicas (RNF06), documentação (RNF07), auditabilidade (RNF08), isolamento (RNF09), CORS (RNF10), separação de contextos JWT (RNF11), Docker (RNF12), multiplataforma (RNF13), armazenamento seguro do token (RNF14), erros padronizados (RNF15), TypeScript (RNF16), monorepo (RNF17), extensibilidade (RNF18), testabilidade (RNF19) e upload (RNF20).

## 4.5 Regras de Negócio

> Ver lista completa no Apêndice C.

As 40 regras de negócio cobrem: controle de acesso (RN01), criação de acordos (RN02–RN05), fluxo de depósito (RN07–RN11), confirmação dupla (RN13–RN15), disputas (RN16–RN25), renegociação (RN26–RN27), carteira (RN28–RN30), score (RN31–RN33), cartão (RN34–RN35) e blockchain (RN36–RN40).

Regras críticas:
- **RN13/RN14/RN15:** O valor só é liberado quando AMBAS as partes confirmarem.
- **RN18/RN19:** Valor travado por disputa não pode ser movimentado pelas partes.
- **RN21:** Toda disputa deve resultar em ação concreta — `KEEP_LOCKED` foi removido.
- **RN31:** Score não pode ser negativo.

## 4.6 Casos de Uso Principais

Os 12 casos de uso principais são:
- **UC01:** Cadastrar usuário
- **UC02:** Autenticar usuário
- **UC03:** Criar acordo
- **UC04:** Aceitar acordo (recebedor)
- **UC05:** Recusar acordo (recebedor)
- **UC06:** Realizar depósito simulado de garantia (3 fontes)
- **UC07:** Confirmar cumprimento (dupla confirmação)
- **UC08:** Contestar acordo
- **UC09:** Resolver disputa (administrador)
- **UC10:** Consultar carteira
- **UC11:** Consultar score e histórico de reputação
- **UC12:** Ativar cartão virtual

> Cada caso de uso inclui: ator principal, objetivo, pré-condições, fluxo principal, fluxos alternativos e pós-condições. Ver arquivo `05_analise_e_especificacao.md` para descrição completa.

## 4.7 Fluxos Principais

**Fluxo do Acordo com Garantia (caminho feliz):** Criar → PENDING_ACCEPTANCE → Aceitar → WAITING_DEPOSIT → Depositar → ACTIVE/VALUE_HELD → Pagador confirma → Recebedor confirma → valor liberado → COMPLETED/VALUE_RELEASED → score +5 ambos.

**Fluxo de Disputa:** ACTIVE → Contestar → IN_DISPUTE/VALUE_LOCKED_BY_DISPUTE → Admin decide → valor liberado/reembolsado ou renegociado → score atualizado.

**Fluxo de Renegociação:** ACTIVE → Propor nova data → IN_NEGOTIATION → Outra parte aceita → ACTIVE com nova dueDate (ou recusa → status anterior).

---

# CAPÍTULO 5 — PROJETO E ARQUITETURA DA SOLUÇÃO

## 5.1 Arquitetura Geral

O SeloPay foi projetado como um sistema cliente-servidor com comunicação via HTTP REST, composto por três camadas:

1. **Camada de Apresentação:** Aplicativo mobile (Expo/React Native) com comunicação via Axios.
2. **Camada de Aplicação:** API REST (NestJS/Node.js) com toda a lógica de negócio.
3. **Camada de Dados:** PostgreSQL 16 via Prisma ORM, acessado exclusivamente pela API.

## 5.2 Estrutura do Projeto (Monorepo)

```
SeloPay/
├── apps/
│   ├── api/        # Backend NestJS (porta 3333)
│   └── mobile/     # Expo/React Native
├── docker-compose.yml
├── pnpm-workspace.yaml
└── .env
```

## 5.3 Backend

O backend é organizado em 8 módulos NestJS independentes: `auth`, `users`, `wallet`, `agreements`, `disputes`, `admin`, `score` (global) e `blockchain` (global). Cada módulo tem seu controller, service e DTOs. Configurações globais em `main.ts`: prefixo `/api`, ValidationPipe, Swagger em `/docs`, CORS e ThrottlerModule (60 req/min).

## 5.4 Aplicativo Mobile

Desenvolvido com Expo 54 e React Native 0.81.5, utilizando Expo Router 6 para roteamento baseado em arquivos. Estrutura: `(auth)/` (boas-vindas, login, cadastro), `(tabs)/` (home, carteira, acordos, perfil), `(admin)/` (disputas, detalhe disputa), `agreements/` (criar, detalhe) e telas individuais (deposit, score, virtual-card, blockchain-proof, notifications).

Contextos globais: `AuthContext` (usuário), `AdminAuthContext` (administrador), `NotificationsContext`. Axios configurado com interceptores de autenticação e tratamento de 401.

## 5.5 Painel Administrativo

Implementado como telas no próprio mobile em `app/(admin)/`, protegidas pelo `AdminJwtGuard`. Telas: lista de disputas com filtro por urgência e detalhe com evidências, histórico e modal de decisão.

## 5.6 Banco de Dados

Schema Prisma com 17 entidades, 14 enumerações e migrations versionadas. Ver Tabela 5 completa no Apêndice E. Entidades principais: `User`, `Wallet`, `Agreement`, `AgreementConfirmation`, `Dispute`, `DisputeEvidence`, `DisputeHistory`, `DisputeResponse`, `Negotiation`, `SimulatedPayment`, `PixDeposit`, `ScoreEvent`, `BlockchainRecord`, `VirtualCard`, `CardTransaction`, `AdminUser`.

## 5.7 APIs e Endpoints

Mais de 35 endpoints em 8 módulos. Ver tabela completa no Apêndice D.

## 5.8 Segurança e Autenticação

**Dois contextos JWT separados:** `JWT_SECRET` (usuário, 7 dias) e `ADMIN_JWT_SECRET` (admin, 1 dia) com secrets distintos. `JwtAuthGuard` e `AdminJwtGuard` validam e segregam os acessos. Senha com bcrypt salt 10. CPF mascarado em todas as respostas. Rate limiting 60 req/min. ValidationPipe com `whitelist: true`.

## 5.9 Rastreabilidade e Registros

**Blockchain interno:** `BlockchainService` global registra eventos em cadeia SHA256. Cada registro contém: `eventType`, `payload`, `previousHash`, `hash` (SHA256), `txHash` (`SELO` + 16 hex). 16+ tipos de evento cobrem todo o ciclo de vida. Registro não bloqueante (`.catch(() => {})`).

**Score:** `ScoreService` global atualiza `user.score` e persiste `ScoreEvent` a cada evento comportamental. Score nunca fica negativo.

---

# CAPÍTULO 6 — DESENVOLVIMENTO DO MVP

## 6.1 Implementação dos Acordos Digitais

O módulo `agreements` implementa uma máquina de estados com dois campos complementares: `status` (`AgreementStatus`, 9 valores) e `financialStatus` (`FinancialStatus`, 9 valores). O `AgreementsService` valida o estado atual antes de cada transição, retornando `BadRequestException` para transições inválidas.

## 6.2 Implementação do Acordo Simples

No schema atual, apenas `AgreementType.GUARANTEED` existe. A distinção entre simples e com garantia ocorre no nível do fluxo: acordos sem depósito permanecem com `financialStatus = NO_FINANCIAL_MOVEMENT` e são concluídos sem movimentação financeira. Para trabalhos futuros, recomenda-se introduzir `AgreementType.SIMPLE` para tornar explícita a distinção.

## 6.3 Implementação do Acordo com Garantia

Três métodos de depósito:
- **Via carteira:** Verifica `availableBalance >= amount`; transação atômica decrementa `availableBalance`, incrementa `blockedBalance`.
- **Via Pix:** Cria `SimulatedPayment` com `fakePixCode`/`fakeQrCode`; confirmação manual via endpoint demo; incrementa `blockedBalance` sem verificar saldo.
- **Via cartão:** Verifica `(creditLimit - usedLimit) >= amount`; cria `CardTransaction.GUARANTEE_BLOCK`; incrementa `usedLimit` (não afeta carteira).

## 6.4 Implementação da Carteira

Criada automaticamente no cadastro via criação aninhada do Prisma. `WalletService` expõe: consulta de saldo, histórico (últimas 100), geração de Pix de depósito (30 min de expiração) e `simulate-credit` (endpoint demo). Todas as operações registram `WalletTransaction`.

## 6.5 Implementação do Pix Simulado

Dois fluxos: (1) Pix para depósito na carteira — cria `PixDeposit` com QR Code e copia-e-cola fictícios, confirmação manual via `simulate-confirm`; (2) Pix para garantia de acordo — cria `SimulatedPayment`. Nenhuma integração real com o SPI ou PSPs.

## 6.6 Implementação da Dupla Confirmação

`confirmAgreement()` identifica o papel do solicitante, valida que o tipo de confirmação é compatível, verifica que o usuário não confirmou ainda, cria `AgreementConfirmation` e, se as duas confirmações existirem, executa a liberação em transação atômica: decrementa `blockedBalance` do pagador, incrementa `availableBalance` do recebedor, registra transações, atualiza acordo para `COMPLETED/VALUE_RELEASED` e dispara eventos de score e blockchain.

## 6.7 Implementação das Disputas

`DisputesService` verifica participação no acordo e status `ACTIVE/IN_NEGOTIATION` antes de criar a disputa. Transação cria `Dispute`, atualiza acordo para `IN_DISPUTE/VALUE_LOCKED_BY_DISPUTE`, registra score negativo e evento blockchain.

`AdminService.resolveDispute()` delega para métodos privados especializados: `executeReleaseToReceiver`, `executeRefundToPayer` e `executeRenegotiation`, cada um com tratamento específico para garantias via cartão (usando `GUARANTEE_SETTLE`/`GUARANTEE_RELEASE`) versus garantias via carteira/Pix.

## 6.8 Implementação de Histórico, Reputação e Score

`ScoreService.recordEvent()` atualiza `user.score` com o delta correspondente ao tipo de evento (mínimo zero) e persiste `ScoreEvent`. Oito tipos de eventos cobrem comportamentos positivos (+2 a +5) e negativos (-3 a -15).

## 6.9 Implementação do Blockchain Interno

```typescript
// Lógica de encadeamento simplificada:
const previousHash = last?.hash ?? '0'.repeat(64);
const dataToHash = previousHash + eventType + JSON.stringify(payload);
const hash = createHash('sha256').update(dataToHash).digest('hex');
const txHash = 'SELO' + randomBytes(8).toString('hex').toUpperCase();
```

Chamada não bloqueante em todos os módulos: `this.blockchain.registerEvent({...}).catch(() => {})`.

## 6.10 Cartão Virtual Baseado em Confiança

Limite calculado por faixas de score: < 300 → R$0 (sem ativação); 300-499 → R$50; 500-699 → R$150; 700-849 → R$300; ≥ 850 → R$500. Ativação cria cartão com número mascarado e expiração em 2 anos. `recalculate-limit` atualiza `creditLimit` sem alterar `usedLimit`.

---

# CAPÍTULO 7 — TESTES E VALIDAÇÃO

## 7.1 Estratégia de Testes

A validação foi conduzida por testes manuais e exploratórios via: Swagger UI, aplicativo mobile, verificação direta no banco PostgreSQL e TypeScript typecheck (`tsc --noEmit` → 0 erros em ambos os projetos). A estrutura Jest está configurada mas os testes automatizados de integração não foram completados no MVP.

## 7.2 Cenários Testados

40 cenários foram executados e validados, cobrindo: cadastro, login, busca por SeloKey, criação de acordo, aceite, recusa, depósito (3 fontes), confirmação individual, dupla confirmação, contestação, resposta, upload de evidências, resolução admin (3 tipos de decisão), renegociação, score, cartão virtual, blockchain e typecheck.

> Ver Tabela 7 completa no arquivo `08_testes_e_validacao.md`.

Todos os 40 cenários retornaram status ✅ (conforme esperado).

## 7.3 Limitações dos Testes

Limitações reconhecidas: ausência de testes automatizados, ausência de testes de carga e concorrência, ausência de testes de segurança formal, cobertura parcial de telas mobile, dependência de ambiente local e ausência de suite de regressão.

---

# CAPÍTULO 8 — RESULTADOS E DISCUSSÃO

## 8.1 Resultados Alcançados

17 dos 18 objetivos específicos foram completamente implementados. O único objetivo parcial é OE18 (notificações), onde a infraestrutura foi criada mas push real não foi integrado.

A API conta com 35+ endpoints documentados via Swagger. O mobile tem 20+ telas. O banco define 17 entidades e 14 enumerações com migrations versionadas. TypeScript typecheck: 0 erros em ambos os projetos.

## 8.2 Discussão

**NestJS** facilitou a organização modular — cada funcionalidade é encapsulada com responsabilidades claras. **Prisma** com PostgreSQL provou-se eficaz para domínio complexo com garantia de tipagem e transações atômicas. **React Native com Expo** permitiu interface funcional multiplataforma no tempo de desenvolvimento de um TCC.

**Decisões de design relevantes:**
- Separação de secrets JWT por contexto (usuário/admin) — mitigação de comprometimento de credenciais.
- Transações atômicas em todas as operações financeiras — garantia de consistência.
- Remoção do KEEP_LOCKED — toda disputa deve resultar em ação concreta.
- Blockchain não bloqueante — falha no registro não interrompe operação principal.

## 8.3 Diferenciais do Projeto

| Diferencial | Descrição |
|-------------|-----------|
| Dupla confirmação obrigatória | Valor liberado apenas com consenso mútuo explícito |
| Três fontes de garantia | Carteira, Pix simulado e cartão virtual |
| Reputação integrada ao limite | Score impacta diretamente o cartão virtual |
| Resolução estruturada de conflitos | Evidências, contraditório e decisão administrativa |
| Blockchain como evidência | Cadeia SHA256 de todos os eventos do acordo |
| SeloKey como identidade | Chave pública amigável sem expor CPF |
| Separação admin/usuário | JWTs distintos, acessos completamente segregados |

## 8.4 Limitações do MVP

Principais limitações: sem operação financeira real; Pix 100% simulado; sem KYC real; blockchain não distribuído; sem smart contracts; sem notificações push reais; armazenamento local de evidências; sem testes automatizados completos; sem CI/CD; score simplificado; cartão sem bandeira real; admin único centralizado; expiração on-demand; sem conformidade regulatória.

---

# CAPÍTULO 9 — CONSIDERAÇÕES FINAIS

## 9.1 Conclusão

O SeloPay foi desenvolvido como MVP funcional, demonstrando a viabilidade técnica e conceitual de uma plataforma de confiança digital para acordos informais. O objetivo central foi alcançado: um sistema que formaliza compromissos digitalmente, protege valores por meio de garantia simulada com dupla confirmação, resolve conflitos de forma estruturada e rastreia a reputação dos usuários.

Do ponto de vista técnico, o projeto integrou de forma coesa: API REST modular (NestJS + Prisma + PostgreSQL), aplicativo mobile multiplataforma (React Native + Expo Router), autenticação JWT com dois contextos, máquina de estados para ciclo de vida de acordos, transações atômicas para operações financeiras, blockchain interno por encadeamento SHA256 e sistema de score comportamental.

As limitações são reconhecidas explicitamente como parte da honestidade acadêmica do trabalho e representam o ponto de partida para trabalhos futuros.

## 9.2 Contribuições do Projeto

- **Técnica:** Arquitetura modular completa para sistema de confiança digital, com API, mobile, banco e autenticação integrados.
- **Conceitual:** Implementação do mecanismo de dupla confirmação como requisito obrigatório para liberação de valor.
- **Metodológica:** Documentação explícita do que é simulado, real e conceitual — modelo de honestidade acadêmica.
- **Prática:** Código-fonte completo em monorepo com documentação Swagger, útil como referência para trabalhos futuros.
- **Social:** Demonstração de infraestrutura digital de confiança acessível por dispositivo mobile.

## 9.3 Trabalhos Futuros

**Técnicos:** Integração com Pix real (PSP + webhook); testes automatizados completos com Jest; jobs agendados para expiração de acordos; notificações push reais (FCM/APNs); armazenamento de evidências em nuvem (S3/R2); CI/CD via GitHub Actions; blockchain em testnet pública.

**Produto:** `AgreementType.SIMPLE` no schema; score multifatorial; templates de acordos; versão web (Next.js); análise antifraude; exportação de comprovante em PDF; múltiplos administradores.

**Regulatório:** Conformidade com LGPD; KYC progressivo integrado a bureaus; autorização como Instituição de Pagamento (Lei nº 12.865/2013); controles PLD/AML.

---

# REFERÊNCIAS

BANCO CENTRAL DO BRASIL. **Pix: o que é e como funciona.** Brasília: BCB, 2020.

BANCO CENTRAL DO BRASIL. **Relatório de Pagamentos do Banco Central — 2022.** Brasília: BCB, 2023. [REFERÊNCIA A CONFIRMAR]

BECK, K. et al. **Manifesto para Desenvolvimento Ágil de Software.** 2001. Disponível em: <https://agilemanifesto.org/iso/ptbr/manifesto.html>.

DELLAROCAS, C. The Digitization of Word of Mouth: Promise and Challenges of Online Feedback Mechanisms. **Management Science**, v. 49, n. 10, p. 1407-1424, 2003. [REFERÊNCIA A CONFIRMAR]

GEFEN, D.; STRAUB, D. Consumer Trust in B2C E-Commerce and the Importance of Social Presence. **Omega**, v. 32, n. 6, p. 407-424, 2004. [REFERÊNCIA A CONFIRMAR]

GIL, A. C. **Métodos e Técnicas de Pesquisa Social.** 6. ed. São Paulo: Atlas, 2008.

HEVNER, A. R. et al. Design Science in Information Systems Research. **MIS Quarterly**, v. 28, n. 1, p. 75-105, 2004.

LUHMANN, N. Familiarity, Confidence, Trust. In: GAMBETTA, D. (org.). **Trust: Making and Breaking Cooperative Relations.** Oxford: University of Oxford, 2000. [REFERÊNCIA A CONFIRMAR]

MAYER, R. C.; DAVIS, J. H.; SCHOORMAN, F. D. An Integrative Model of Organizational Trust. **Academy of Management Review**, v. 20, n. 3, p. 709-734, 1995.

NAKAMOTO, S. **Bitcoin: A Peer-to-Peer Electronic Cash System.** 2008. Disponível em: <https://bitcoin.org/bitcoin.pdf>.

NAKASUMI, M. Information Sharing for Supply Chain Management Based on Block Chain Technology. In: **IEEE 19th Conference on Business Informatics**, 2017. [REFERÊNCIA A CONFIRMAR]

PARKER, G.; VAN ALSTYNE, M.; CHOUDARY, S. P. **Platform Revolution.** New York: W. W. Norton & Company, 2016.

RESNICK, P.; VARIAN, H. R. Recommender Systems. **Communications of the ACM**, v. 40, n. 3, p. 56-58, 1997.

RESNICK, P. et al. Reputation Systems. **Communications of the ACM**, v. 43, n. 12, p. 45-48, 2000.

RIES, E. **The Lean Startup.** New York: Crown Business, 2011.

SOMMERVILLE, I. **Engenharia de Software.** 9. ed. São Paulo: Pearson, 2011.

SWANSON, T. **Consensus-as-a-Service.** R3CEV LLC, 2015. [REFERÊNCIA A CONFIRMAR]

SZABO, N. **The Idea of Smart Contracts.** 1997. Disponível em: <https://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/idea.html>.

WESTERMAN, G.; BONNET, D.; McAFEE, A. **Leading Digital.** Boston: Harvard Business Review Press, 2014. [REFERÊNCIA A CONFIRMAR]

WILLIAMSON, O. E. **The Economic Institutions of Capitalism.** New York: Free Press, 1985.

BRASIL. **Lei nº 12.865, de 9 de outubro de 2013.** Dispõe sobre arranjos de pagamento.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018.** Lei Geral de Proteção de Dados Pessoais (LGPD).

BRASIL. **Medida Provisória nº 2.200-2, de 24 de agosto de 2001.** Institui a ICP-Brasil.

---

# APÊNDICES

> Os apêndices completos com tabelas detalhadas de requisitos (RF, RNF), regras de negócio numeradas (RN01-RN40), todos os endpoints da API, estrutura completa do banco de dados, matriz de cobertura e telas do aplicativo encontram-se nos arquivos separados por capítulo em `TCC_SELOPAY_CAPITULOS_SEPARADOS/12_apendices.md`.

## APÊNDICE A — Requisitos Funcionais (resumido)
> 35 requisitos — RF01 a RF35 — ver arquivo completo.

## APÊNDICE B — Requisitos Não Funcionais (resumido)
> 20 requisitos — RNF01 a RNF20 — ver arquivo completo.

## APÊNDICE C — Regras de Negócio (resumido)
> 40 regras — RN01 a RN40 — ver arquivo completo.

## APÊNDICE D — Endpoints da API (resumido)
> 35+ endpoints em 8 módulos — ver arquivo completo.

## APÊNDICE E — Banco de Dados (resumido)
> 17 entidades, 14 enumerações — ver arquivo completo.

## APÊNDICE F — Matriz de Cobertura do MVP
> Ver arquivo completo.

## APÊNDICE G — Telas do Aplicativo Mobile
> **[AGUARDA INSERÇÃO DE PRINTS]** — 20+ capturas de tela a inserir.

---

*Documento gerado com base na análise direta do código-fonte do repositório SeloPay.*
*Nenhum arquivo do projeto foi alterado durante a geração deste documento.*
