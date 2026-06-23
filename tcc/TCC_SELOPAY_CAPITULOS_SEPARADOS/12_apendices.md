# APÊNDICES

## APÊNDICE A — Tabela Completa de Requisitos Funcionais

| Código | Requisito | Descrição | Status |
|--------|-----------|-----------|--------|
| RF01 | Cadastro de usuário | Permite cadastro com nome, CPF, e-mail e senha | Implementado |
| RF02 | Geração de SeloKey | Gera chave pública única `@nome6HEX` | Implementado |
| RF03 | Autenticação JWT | Autentica com e-mail e senha, retorna JWT | Implementado |
| RF04 | Carteira automática | Carteira criada no cadastro com saldo zero | Implementado |
| RF05 | Busca por SeloKey | Localiza usuário pela SeloKey | Implementado |
| RF06 | Criar acordo | Cria acordo entre dois usuários distintos | Implementado |
| RF07 | Registro de termos | Partes, valor, descrição, prazo | Implementado |
| RF08 | Aceite e recusa | Recebedor aceita ou recusa o acordo | Implementado |
| RF09 | Expiração | Acordo não respondido expira em 1h | Implementado (on-demand) |
| RF10 | Depósito via carteira | Garantia pelo saldo disponível | Implementado |
| RF11 | Depósito via Pix | Garantia via Pix simulado | Implementado |
| RF12 | Depósito via cartão | Garantia via cartão virtual | Implementado |
| RF13 | Bloqueio de saldo | Valor bloqueado enquanto acordo ativo | Implementado |
| RF14 | Confirmação individual | Cada parte confirma o cumprimento | Implementado |
| RF15 | Liberação por dupla confirmação | Valor liberado apenas com duas confirmações | Implementado |
| RF16 | Crédito ao recebedor | Valor creditado na carteira do recebedor | Implementado |
| RF17 | Abertura de contestação | Qualquer participante pode contestar em acordo ativo | Implementado |
| RF18 | Travamento em disputa | VALUE_LOCKED_BY_DISPUTE ao contestar | Implementado |
| RF19 | Envio de evidências | Upload de arquivos como evidência | Implementado |
| RF20 | Resposta à contestação | Parte contestada responde com mensagem e evidências | Implementado |
| RF21 | Painel administrativo | Painel com autenticação separada | Implementado |
| RF22 | Consulta admin | Admin visualiza tudo | Implementado |
| RF23 | Decisão admin | Admin registra decisão em disputas | Implementado |
| RF24 | Registro de score | Score atualizado por eventos de comportamento | Implementado |
| RF25 | Score do usuário | Score calculado e disponibilizado | Implementado |
| RF26 | Cartão virtual | Limite calculado pelo score | Implementado |
| RF27 | Blockchain interno | Eventos registrados em cadeia SHA256 | Implementado |
| RF28 | Depósito Pix na carteira | Saldo via Pix simulado na carteira | Implementado |
| RF29 | Histórico da carteira | Histórico de transações (últimas 100) | Implementado |
| RF30 | Renegociação | Proposição e aceite de nova data | Implementado |
| RF31 | Validação de papel | Proponente não aceita própria proposta | Implementado |
| RF32 | Prova blockchain | Tela de verificação dos eventos encadeados | Implementado |
| RF33 | Mascaramento CPF | CPF mascarado em todas as respostas | Implementado |
| RF34 | Notificações internas | Notificações de eventos | Parcial |
| RF35 | Dashboard admin | Métricas gerais para administrador | Implementado |

---

## APÊNDICE B — Tabela Completa de Requisitos Não Funcionais

| Código | Requisito | Descrição | Status |
|--------|-----------|-----------|--------|
| RNF01 | Segurança de senha | bcrypt salt 10 | Implementado |
| RNF02 | JWT com expiração | 7 dias (usuário), 1 dia (admin) | Implementado |
| RNF03 | Privacidade CPF | CPF completo nunca retornado | Implementado |
| RNF04 | Rate limiting | 60 req/min por IP | Implementado |
| RNF05 | Validação de DTOs | class-validator, whitelist: true | Implementado |
| RNF06 | Transações atômicas | Prisma $transaction em operações financeiras | Implementado |
| RNF07 | Swagger/OpenAPI | Documentação automática em /docs | Implementado |
| RNF08 | Auditabilidade | Hashes SHA256 encadeados | Implementado |
| RNF09 | Isolamento do banco | Acesso somente via API | Implementado |
| RNF10 | CORS | Configurado com origens permitidas | Implementado |
| RNF11 | Separação de contextos JWT | Secrets distintos usuário/admin | Implementado |
| RNF12 | Docker | PostgreSQL via Docker Compose | Implementado |
| RNF13 | Multiplataforma | iOS e Android (React Native) | Implementado |
| RNF14 | Token seguro | expo-secure-store | Implementado |
| RNF15 | Erros padronizados | HTTP errors com mensagens claras | Implementado |
| RNF16 | TypeScript | Tipagem estrita em todo o projeto | Implementado |
| RNF17 | Monorepo pnpm | Workspaces gerenciados com pnpm | Implementado |
| RNF18 | Extensibilidade | Arquitetura NestJS modular | Implementado |
| RNF19 | Testabilidade | Jest configurado | Parcial |
| RNF20 | Upload de evidências | multer para imagens e documentos | Implementado |

---

## APÊNDICE C — Regras de Negócio Numeradas

| Código | Regra |
|--------|-------|
| RN01 | Somente usuários autenticados podem criar, visualizar ou interagir com acordos |
| RN02 | O pagador não pode ser o mesmo que o recebedor |
| RN03 | O recebedor é identificado pela SeloKey, nunca por CPF ou e-mail |
| RN04 | A SeloKey é única e imutável após o cadastro |
| RN05 | Acordos em PENDING_ACCEPTANCE expiram em 1 hora |
| RN06 | Apenas o recebedor pode aceitar ou recusar em PENDING_ACCEPTANCE |
| RN07 | Após aceite, acordo com garantia exige depósito para ficar ACTIVE |
| RN08 | Depósito via carteira exige availableBalance >= amount |
| RN09 | Depósito via Pix não verifica saldo — simula pagamento externo |
| RN10 | Depósito via cartão exige cartão ACTIVE com limite disponível suficiente |
| RN11 | Após depósito, valor fica em blockedBalance — não disponível para uso |
| RN12 | Acordo sem garantia financeira não altera nenhum saldo |
| RN13 | A liberação do valor exige confirmação de AMBAS as partes |
| RN14 | Pagador confirma OBLIGATION_FULFILLED; Recebedor confirma READY_TO_RECEIVE |
| RN15 | Somente após as duas confirmações o valor é transferido |
| RN16 | Disputa só pode ser aberta em ACTIVE ou IN_NEGOTIATION |
| RN17 | Qualquer participante pode abrir a disputa |
| RN18 | Ao contestar acordo com garantia, financialStatus → VALUE_LOCKED_BY_DISPUTE |
| RN19 | Nenhuma parte pode mover valor travado em disputa |
| RN20 | Somente o administrador pode resolver disputas |
| RN21 | KEEP_LOCKED removido — toda disputa resulta em ação concreta |
| RN22 | RELEASE_TO_RECEIVER → valor ao recebedor, acordo COMPLETED |
| RN23 | REFUND_TO_PAYER → valor ao pagador, acordo CANCELLED |
| RN24 | PROPOSE_RENEGOTIATION → nova proposta +7 dias, acordo IN_NEGOTIATION |
| RN25 | Disputas RESOLVED ou CLOSED não aceitam nova decisão |
| RN26 | Proponente não pode aceitar sua própria renegociação |
| RN27 | Renegociação expira em 48 horas sem resposta |
| RN28 | Cada usuário tem exatamente uma carteira, criada no cadastro |
| RN29 | availableBalance = saldo livre; blockedBalance = saldo comprometido |
| RN30 | Usuário não pode movimentar diretamente o saldo bloqueado |
| RN31 | Score inicial = 100; não pode ser negativo |
| RN32 | Score determina o limite do cartão virtual |
| RN33 | Score < 300 impede ativação do cartão virtual |
| RN34 | Cada usuário pode ter no máximo um cartão virtual |
| RN35 | Cartão virtual não é integrado a bandeiras ou processadoras reais |
| RN36 | Todo evento relevante gera BlockchainRecord com hash SHA256 encadeado |
| RN37 | Blockchain interno não se conecta a redes públicas ou distribuídas |
| RN38 | CPF completo nunca é retornado em nenhuma resposta da API |
| RN39 | Acordo só pode ser visto pelos participantes (exceto pelo admin) |
| RN40 | Admin pode visualizar todos os acordos, usuários e disputas |

---

## APÊNDICE D — Endpoints da API

> Prefixo global: `/api` | Base URL: `http://localhost:3333`
> Swagger: `http://localhost:3333/docs`

### Autenticação

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| POST | /auth/register | Pública | Cadastrar usuário |
| POST | /auth/login | Pública | Autenticar usuário |
| GET | /auth/me | JWT usuário | Dados do usuário logado |

### Usuários

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| GET | /users/me | JWT usuário | Perfil completo |
| GET | /users/by-key/:seloKey | JWT usuário | Buscar por SeloKey |
| GET | /users/:id | JWT usuário | Buscar por ID |
| GET | /users/:id/score-events | JWT usuário | Histórico de score (últimas 50) |

### Carteira

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| GET | /wallet | JWT usuário | Saldo e dados da carteira |
| GET | /wallet/transactions | JWT usuário | Histórico (últimas 100) |
| POST | /wallet/deposits/pix | JWT usuário | Gerar Pix de depósito |
| POST | /wallet/deposits/:id/simulate-confirm | JWT usuário | Confirmar Pix (demo) |
| POST | /wallet/simulate-credit | JWT usuário | Adicionar saldo (demo) |

### Acordos

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| POST | /agreements | JWT usuário | Criar acordo |
| GET | /agreements | JWT usuário | Listar acordos |
| GET | /agreements/:id | JWT usuário | Detalhe do acordo |
| POST | /agreements/:id/accept | JWT usuário | Aceitar acordo |
| POST | /agreements/:id/reject | JWT usuário | Recusar acordo |
| POST | /agreements/:id/simulate-deposit | JWT usuário | Depósito via carteira |
| POST | /agreements/:id/simulate-deposit-pix | JWT usuário | Depósito via Pix |
| POST | /agreements/:id/simulate-deposit-card | JWT usuário | Depósito via cartão |
| POST | /agreements/:id/confirm | JWT usuário | Confirmar cumprimento |
| POST | /agreements/:id/negotiate | JWT usuário | Propor renegociação |
| POST | /agreements/:id/negotiate/accept | JWT usuário | Aceitar renegociação |
| POST | /agreements/:id/negotiate/reject | JWT usuário | Recusar renegociação |

### Disputas

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| POST | /disputes | JWT usuário | Abrir contestação |
| GET | /disputes | JWT usuário | Minhas disputas |
| GET | /disputes/:id | JWT usuário | Detalhe da disputa |
| POST | /disputes/:id/evidence | JWT usuário | Upload de evidências |
| POST | /disputes/:id/respond | JWT usuário | Responder contestação |

### Cartão Virtual

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| GET | /virtual-card/me | JWT usuário | Dados do cartão |
| POST | /virtual-card/activate | JWT usuário | Ativar cartão |
| POST | /virtual-card/recalculate-limit | JWT usuário | Recalcular limite |
| GET | /virtual-card/transactions | JWT usuário | Histórico do cartão |

### Administrador

| Método | Rota | Autenticação | Finalidade |
|--------|------|-------------|-----------|
| POST | /admin/auth/login | Pública | Login admin |
| GET | /admin/dashboard | JWT admin | Métricas gerais |
| GET | /admin/users | JWT admin | Listar usuários |
| GET | /admin/agreements | JWT admin | Listar acordos |
| GET | /admin/disputes | JWT admin | Listar disputas |
| GET | /admin/disputes/:id | JWT admin | Detalhe da disputa |
| POST | /admin/disputes/:id/decision | JWT admin | Registrar decisão |

---

## APÊNDICE E — Estrutura do Banco de Dados

### Enumerações do Schema

**AgreementStatus:**
`DRAFT` | `PENDING_ACCEPTANCE` | `EXPIRED` | `REJECTED` | `WAITING_DEPOSIT` | `ACTIVE` | `IN_NEGOTIATION` | `IN_DISPUTE` | `COMPLETED` | `CANCELLED`

**FinancialStatus:**
`NO_FINANCIAL_MOVEMENT` | `WAITING_SIMULATED_DEPOSIT` | `SIMULATED_PAYMENT_PROCESSING` | `SIMULATED_PAYMENT_CONFIRMED` | `VALUE_HELD` | `VALUE_LOCKED_BY_DISPUTE` | `VALUE_RELEASED` | `REFUND_PENDING` | `VALUE_REFUNDED`

**AdminDecisionType:**
`RELEASE_TO_RECEIVER` | `REFUND_TO_PAYER` | `PROPOSE_RENEGOTIATION` | `REQUEST_MORE_EVIDENCE`

**DisputeStatus:**
`OPEN` | `UNDER_REVIEW` | `RESOLVED` | `CLOSED`

**WalletTransactionType:**
`SIMULATED_DEPOSIT` | `VALUE_HELD` | `VALUE_RELEASED` | `VALUE_RECEIVED` | `SIMULATED_REFUND` | `VALUE_LOCKED_BY_DISPUTE` | `DISPUTE_RESOLVED_RELEASE` | `DISPUTE_RESOLVED_REFUND`

**ScoreEventType:**
`AGREEMENT_COMPLETED` | `DISPUTE_WON` | `AGREEMENT_DISPUTED_RESOLVED` | `RENEGOTIATION_ACCEPTED` | `DISPUTE_OPENED_AGAINST_USER` | `DISPUTE_LOST` | `LATE_PAYMENT` | `AGREEMENT_DEFAULTED`

**BlockchainEventType:**
`AGREEMENT_CREATED` | `AGREEMENT_ACCEPTED` | `AGREEMENT_REJECTED` | `AGREEMENT_CANCELLED` | `AGREEMENT_COMPLETED` | `GUARANTEE_DEPOSITED_WALLET` | `GUARANTEE_DEPOSITED_PIX` | `GUARANTEE_DEPOSITED_CARD` | `VALUE_RELEASED` | `VALUE_REFUNDED` | `DISPUTE_OPENED` | `DISPUTE_RESPONSE_ADDED` | `ADMIN_DECISION_RELEASE` | `ADMIN_DECISION_REFUND` | `ADMIN_DECISION_RENEGOTIATION` | `RENEGOTIATION_ACCEPTED` | `PIX_DEPOSIT_CONFIRMED` | `CARD_ACTIVATED` | `CARD_LIMIT_RECALCULATED` | `CARD_LIMIT_BLOCKED` | `CARD_LIMIT_RELEASED`

**VirtualCardStatus:** `INACTIVE` | `ACTIVE` | `BLOCKED`

**CardTransactionType:** `GUARANTEE_BLOCK` | `GUARANTEE_RELEASE` | `GUARANTEE_SETTLE`

**NegotiationStatus:** `PENDING` | `ACCEPTED` | `REJECTED` | `EXPIRED`

**PixDepositStatus:** `PENDING` | `CONFIRMED` | `EXPIRED` | `FAILED`

**SimulatedPaymentStatus:** `PENDING` | `PROCESSING` | `CONFIRMED` | `FAILED`

---

## APÊNDICE F — Matriz de Cobertura do MVP

| Funcionalidade | Backend | Mobile | Admin | Status |
|----------------|---------|--------|-------|--------|
| Cadastro/Login | ✅ | ✅ | ✅ | Completo |
| SeloKey | ✅ | ✅ | — | Completo |
| Criar acordo | ✅ | ✅ | — | Completo |
| Aceitar/Recusar | ✅ | ✅ | — | Completo |
| Depósito (carteira) | ✅ | ✅ | — | Completo |
| Depósito (Pix) | ✅ | ✅ | — | Completo |
| Depósito (cartão) | ✅ | ✅ | — | Completo |
| Dupla confirmação | ✅ | ✅ | — | Completo |
| Contestação | ✅ | ✅ | — | Completo |
| Upload evidências | ✅ | ✅ | — | Completo |
| Resolução admin | ✅ | — | ✅ | Completo |
| Score/reputação | ✅ | ✅ | — | Completo |
| Renegociação | ✅ | ✅ | — | Completo |
| Blockchain | ✅ | ✅ | — | Completo |
| Cartão virtual | ✅ | ✅ | — | Completo |
| Carteira/histórico | ✅ | ✅ | — | Completo |
| Notificações | ✅ (schema) | ⚠️ (parcial) | — | Parcial |
| Dashboard admin | ✅ | — | ✅ | Completo |

---

## APÊNDICE G — Telas do Aplicativo Mobile

> **[AGUARDA INSERÇÃO DE PRINTS/CAPTURAS DE TELA]**
>
> Este apêndice deve conter capturas de tela das seguintes telas do aplicativo SeloPay:

1. **Tela de boas-vindas** — welcome.tsx
2. **Tela de login** — login.tsx
3. **Tela de cadastro** — register.tsx
4. **Home — Dashboard** — home.tsx com saldo e acordos recentes
5. **Carteira** — wallet.tsx com saldo disponível/bloqueado
6. **Lista de acordos** — agreements.tsx com filtros por status
7. **Criar acordo** — create.tsx com formulário
8. **Detalhe do acordo — aguardando aceite** — [id].tsx em PENDING_ACCEPTANCE
9. **Detalhe do acordo — aguardando depósito** — [id].tsx em WAITING_DEPOSIT
10. **Detalhe do acordo — ativo** — [id].tsx em ACTIVE com botões de confirmação
11. **Detalhe do acordo — em disputa** — [id].tsx em IN_DISPUTE
12. **Detalhe do acordo — concluído** — [id].tsx em COMPLETED
13. **Depósito Pix (carteira)** — deposit.tsx com QR Code fake
14. **Depósito Pix (garantia)** — deposit-pix.tsx com código de garantia
15. **Score e reputação** — score.tsx com gauge visual e histórico
16. **Cartão virtual** — virtual-card.tsx com dados e histórico
17. **Prova blockchain** — blockchain-proof.tsx com cadeia de hashes
18. **Perfil** — profile.tsx com SeloKey e dados pessoais
19. **Lista de disputas (admin)** — (admin)/disputes.tsx
20. **Detalhe da disputa (admin)** — (admin)/dispute/[id].tsx com modal de decisão

> **Instrução:** Capture as telas com o aplicativo em execução no simulador ou dispositivo real. Adicione número de figura e legenda descritiva a cada captura. Certifique-se de que dados pessoais reais não estejam visíveis nas capturas.
