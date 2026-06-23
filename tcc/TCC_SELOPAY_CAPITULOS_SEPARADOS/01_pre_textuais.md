# ELEMENTOS PRÉ-TEXTUAIS

---

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

---

## FOLHA DE ROSTO

```
[NOME DO ALUNO]

SELOPAY: PLATAFORMA DIGITAL PARA REGISTRO E GARANTIA SIMULADA
DE ACORDOS ENTRE USUÁRIOS

Trabalho de Conclusão de Curso apresentado ao [NOME DO CURSO]
da [NOME DA INSTITUIÇÃO] como requisito parcial para obtenção
do título de [NOME DO TÍTULO — ex: Bacharel em Ciência da
Computação / Sistemas de Informação].

Orientador(a): [NOME DO ORIENTADOR]

[CIDADE]
[ANO]
```

---

## FOLHA DE APROVAÇÃO

```
[NOME DO ALUNO]

SELOPAY: PLATAFORMA DIGITAL PARA REGISTRO E GARANTIA SIMULADA
DE ACORDOS ENTRE USUÁRIOS

Trabalho de Conclusão de Curso aprovado em ____ de __________ de [ANO]
pela banca examinadora constituída pelos professores:

________________________________________________
[NOME DO ORIENTADOR] — Orientador(a)
[NOME DA INSTITUIÇÃO]

________________________________________________
[NOME DO MEMBRO 1]
[NOME DA INSTITUIÇÃO]

________________________________________________
[NOME DO MEMBRO 2]
[NOME DA INSTITUIÇÃO]
```

---

## DEDICATÓRIA

> [A SER PREENCHIDA PELO ALUNO]

---

## AGRADECIMENTOS

> [A SER PREENCHIDA PELO ALUNO]

---

## RESUMO

O presente trabalho descreve o desenvolvimento do SeloPay, uma plataforma digital para criação, registro, acompanhamento e resolução de acordos entre usuários, implementada como Produto Mínimo Viável (MVP) no contexto de um Trabalho de Conclusão de Curso em Ciência da Computação. O problema abordado diz respeito à informalidade e fragilidade dos acordos cotidianos entre pessoas físicas — empréstimos, prestações de serviço, parcelamentos informais — que, na ausência de registro estruturado, frequentemente geram conflitos, inadimplência e perda de confiança. A solução proposta permite que dois usuários formalizem digitalmente um compromisso, acompanhem seu ciclo de vida por meio de uma máquina de estados bem definida, e disponham de mecanismos de garantia simulada de valores, dupla confirmação de cumprimento, contestação com envio de evidências e resolução manual por administrador. O sistema foi desenvolvido sobre uma arquitetura de monorepo com dois aplicativos principais: uma API REST construída com NestJS e TypeScript, sustentada por banco de dados PostgreSQL via Prisma ORM, e um aplicativo mobile multiplataforma desenvolvido com Expo e React Native. Complementarmente, o SeloPay incorpora um sistema de reputação baseado em score comportamental, um cartão virtual com limite calculado dinamicamente conforme o score do usuário, depósito de garantia via Pix simulado, carteira interna com saldo disponível e bloqueado, e um registro encadeado de eventos por meio de hashes SHA256 — referenciado no projeto como blockchain interno simulado. Todos os componentes financeiros são simulados para fins acadêmicos, sem integração com o sistema Pix real, sem custódia de valores reais e sem vínculo com instituições financeiras. Os resultados demonstram que o MVP atende ao objetivo central de formalizar e acompanhar acordos digitais, validando a viabilidade técnica da proposta e identificando limitações a serem superadas em trabalhos futuros.

**Palavras-chave:** acordos digitais; confiança digital; garantia simulada; dupla confirmação; reputação; score; NestJS; React Native; MVP; Produto Mínimo Viável.

---

## ABSTRACT

This work describes the development of SeloPay, a digital platform for the creation, registration, tracking, and resolution of agreements between users, implemented as a Minimum Viable Product (MVP) within the scope of an undergraduate thesis in Computer Science. The problem addressed concerns the informality and fragility of everyday agreements between individuals — loans, service contracts, informal installment payments — which, in the absence of structured records, frequently generate disputes, default, and loss of trust. The proposed solution enables two users to digitally formalize a commitment, monitor its lifecycle through a well-defined state machine, and make use of simulated value guarantee mechanisms, dual confirmation of fulfillment, dispute filing with evidence submission, and manual resolution by an administrator. The system was built on a monorepo architecture with two main applications: a REST API constructed with NestJS and TypeScript, backed by a PostgreSQL database via Prisma ORM, and a cross-platform mobile application developed with Expo and React Native. In addition, SeloPay incorporates a behavioral score-based reputation system, a virtual credit card with a dynamically calculated limit based on the user's score, simulated Pix deposit, an internal wallet with available and blocked balances, and a chained event record using SHA256 hashes — referenced in the project as a simulated internal blockchain. All financial components are simulated for academic purposes, with no integration with the real Pix system, no real value custody, and no ties to financial institutions. The results demonstrate that the MVP meets the central objective of formalizing and monitoring digital agreements, validating the technical feasibility of the proposal and identifying limitations to be addressed in future work.

**Keywords:** digital agreements; digital trust; simulated guarantee; dual confirmation; reputation; score; NestJS; React Native; MVP; Minimum Viable Product.

---

## LISTA DE FIGURAS

> [A SER PREENCHIDA COM OS NÚMEROS E TÍTULOS DAS FIGURAS INSERIDAS — prints de telas, diagramas, fluxogramas]

| Figura | Título | Página |
|--------|--------|--------|
| Figura 1 | Tela de boas-vindas do SeloPay | — |
| Figura 2 | Tela de cadastro de usuário | — |
| Figura 3 | Tela principal (Home) com resumo da carteira | — |
| Figura 4 | Tela de criação de acordo | — |
| Figura 5 | Tela de detalhe do acordo em status ACTIVE | — |
| Figura 6 | Tela de contestação de acordo | — |
| Figura 7 | Tela de score e histórico de reputação | — |
| Figura 8 | Tela de cartão virtual SeloPay | — |
| Figura 9 | Tela de prova blockchain do acordo | — |
| Figura 10 | Painel administrativo — lista de disputas | — |
| Figura 11 | Diagrama de estados do acordo | — |
| Figura 12 | Diagrama de arquitetura geral do sistema | — |
| Figura 13 | Diagrama entidade-relacionamento (ER) | — |

---

## LISTA DE TABELAS

| Tabela | Título | Página |
|--------|--------|--------|
| Tabela 1 | Tecnologias utilizadas no projeto | — |
| Tabela 2 | Requisitos funcionais do sistema | — |
| Tabela 3 | Requisitos não funcionais do sistema | — |
| Tabela 4 | Regras de negócio numeradas | — |
| Tabela 5 | Entidades do banco de dados | — |
| Tabela 6 | Endpoints da API REST | — |
| Tabela 7 | Cenários de testes e validação | — |
| Tabela 8 | Status dos objetivos específicos | — |

---

## LISTA DE SIGLAS E ABREVIATURAS

| Sigla | Significado |
|-------|-------------|
| API | Application Programming Interface |
| ABNT | Associação Brasileira de Normas Técnicas |
| CPF | Cadastro de Pessoas Físicas |
| CRUD | Create, Read, Update, Delete |
| DI | Injeção de Dependência |
| DTO | Data Transfer Object |
| ER | Entidade-Relacionamento |
| HTTP | Hypertext Transfer Protocol |
| JWT | JSON Web Token |
| MVP | Produto Mínimo Viável |
| ORM | Object-Relational Mapping |
| P2P | Peer-to-Peer (ponto a ponto) |
| Pix | Pagamentos Instantâneos (Banco Central do Brasil) |
| REST | Representational State Transfer |
| SHA | Secure Hash Algorithm |
| SPI | Sistema de Pagamentos Instantâneos |
| TCC | Trabalho de Conclusão de Curso |
| UI | User Interface (Interface do Usuário) |
| UX | User Experience (Experiência do Usuário) |

---

## SUMÁRIO

1. INTRODUÇÃO
   - 1.1 Contextualização
   - 1.2 Problema de Pesquisa
   - 1.3 Objetivo Geral
   - 1.4 Objetivos Específicos
   - 1.5 Justificativa
   - 1.6 Delimitação do Projeto
   - 1.7 Organização do Trabalho

2. FUNDAMENTAÇÃO TEÓRICA
   - 2.1 Transformação Digital e Formalização de Processos
   - 2.2 Confiança Digital em Plataformas
   - 2.3 Plataformas de Intermediação e Acordos Digitais
   - 2.4 Sistemas de Pagamento, Escrow e Garantia
   - 2.5 Reputação e Score em Sistemas Digitais
   - 2.6 Blockchain e Rastreabilidade de Eventos
   - 2.7 Produto Mínimo Viável

3. METODOLOGIA
   - 3.1 Tipo de Pesquisa
   - 3.2 Procedimentos Metodológicos
   - 3.3 Tecnologias Utilizadas
   - 3.4 Ambiente de Desenvolvimento
   - 3.5 Critérios de Validação

4. ANÁLISE E ESPECIFICAÇÃO DO SISTEMA
   - 4.1 Visão Geral do SeloPay
   - 4.2 Atores do Sistema
   - 4.3 Requisitos Funcionais
   - 4.4 Requisitos Não Funcionais
   - 4.5 Regras de Negócio
   - 4.6 Casos de Uso
   - 4.7 Fluxos Principais

5. PROJETO E ARQUITETURA DA SOLUÇÃO
   - 5.1 Arquitetura Geral
   - 5.2 Estrutura do Projeto
   - 5.3 Backend
   - 5.4 Aplicativo Mobile
   - 5.5 Painel Administrativo
   - 5.6 Banco de Dados
   - 5.7 APIs e Endpoints
   - 5.8 Segurança e Autenticação
   - 5.9 Rastreabilidade e Registros

6. DESENVOLVIMENTO DO MVP
   - 6.1 Implementação dos Acordos Digitais
   - 6.2 Implementação do Acordo Simples
   - 6.3 Implementação do Acordo com Garantia
   - 6.4 Implementação da Carteira
   - 6.5 Implementação do Pix Simulado
   - 6.6 Implementação da Dupla Confirmação
   - 6.7 Implementação das Disputas
   - 6.8 Implementação de Histórico, Reputação e Score
   - 6.9 Implementação do Blockchain Interno
   - 6.10 Cartão Virtual Baseado em Confiança

7. TESTES E VALIDAÇÃO
   - 7.1 Estratégia de Testes
   - 7.2 Cenários Testados
   - 7.3 Limitações dos Testes

8. RESULTADOS E DISCUSSÃO
   - 8.1 Resultados Alcançados
   - 8.2 Discussão
   - 8.3 Diferenciais do Projeto
   - 8.4 Limitações do MVP

9. CONSIDERAÇÕES FINAIS
   - 9.1 Conclusão
   - 9.2 Contribuições do Projeto
   - 9.3 Trabalhos Futuros

REFERÊNCIAS

APÊNDICES
   - Apêndice A — Tabela Completa de Requisitos Funcionais
   - Apêndice B — Tabela Completa de Requisitos Não Funcionais
   - Apêndice C — Regras de Negócio Numeradas
   - Apêndice D — Endpoints da API
   - Apêndice E — Estrutura do Banco de Dados
   - Apêndice F — Matriz de Cobertura do MVP
   - Apêndice G — Telas do Aplicativo Mobile [AGUARDA PRINTS]
