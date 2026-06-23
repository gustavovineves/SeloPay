# CAPÍTULO 5 — PROJETO E ARQUITETURA DA SOLUÇÃO

## 5.1 Arquitetura Geral

O SeloPay foi projetado como um sistema cliente-servidor com comunicação via HTTP REST. A Figura 12 [AGUARDA DIAGRAMA] ilustra a arquitetura geral do sistema, composta por três camadas principais:

1. **Camada de Apresentação:** Aplicativo mobile desenvolvido com Expo e React Native, responsável pela interface com o usuário final. O aplicativo se comunica exclusivamente com a API por meio do protocolo HTTPS, utilizando Axios como cliente HTTP.

2. **Camada de Aplicação (API):** Servidor NestJS executado em Node.js, responsável por toda a lógica de negócio, validação de dados, autenticação, autorização e orquestração das operações. A API expõe endpoints REST consumíveis tanto pelo aplicativo mobile quanto por ferramentas como o Swagger UI.

3. **Camada de Dados:** Banco de dados PostgreSQL 16, gerenciado por Prisma ORM. O banco é acessado exclusivamente pela API, nunca diretamente pelo cliente mobile.

Adicionalmente, o sistema conta com um painel administrativo integrado ao aplicativo mobile em um conjunto de telas protegidas por autenticação de administrador, comunicando-se com os endpoints `/admin` da API por meio de um contexto de autenticação separado.

---

## 5.2 Estrutura do Projeto

O SeloPay é organizado como um **monorepo pnpm**, com dois aplicativos principais sob o diretório `apps/`:

```
SeloPay/
├── apps/
│   ├── api/                    # Backend NestJS
│   └── mobile/                 # Aplicativo Expo/React Native
├── packages/                   # Pacotes compartilhados (estrutura criada)
├── docker-compose.yml          # Configuração Docker para PostgreSQL
├── pnpm-workspace.yaml         # Definição dos workspaces pnpm
├── package.json                # Scripts globais e devDependencies compartilhadas
└── .env                        # Variáveis de ambiente
```

O monorepo garante que as duas aplicações compartilhem a mesma versão de TypeScript, mesmas convenções de linting e mesmos scripts de qualidade de código. O pnpm gerencia as dependências de cada workspace de forma isolada, evitando conflitos de versão.

---

## 5.3 Backend

O backend do SeloPay é uma API REST construída com **NestJS 10**, organizada em módulos independentes. NestJS adota um paradigma modular inspirado no Angular, no qual cada módulo encapsula seu próprio conjunto de controladores (*controllers*), serviços (*services*), provedores (*providers*) e configurações.

### Estrutura interna do backend

```
apps/api/
├── prisma/
│   ├── schema.prisma               # Modelo de dados completo
│   ├── migrations/                 # Histórico de migrations
│   ├── seed.ts                     # Seed de dados para desenvolvimento
│   └── reset-demo.ts               # Reset completo da massa de demonstração
└── src/
    ├── main.ts                     # Bootstrap: porta, prefixo, Swagger, CORS, pipes
    ├── app.module.ts               # Módulo raiz — importa todos os módulos
    ├── prisma/
    │   └── prisma.service.ts       # PrismaService — injeção global do cliente Prisma
    ├── common/
    │   ├── constants/              # safe-user-select (campos seguros a retornar em User)
    │   ├── decorators/             # @CurrentUser() — extrai usuário do JWT
    │   ├── filters/                # HttpExceptionFilter global
    │   ├── guards/                 # JwtAuthGuard, AdminJwtGuard
    │   └── config/                 # Configuração do Multer para upload
    └── modules/
        ├── auth/                   # Cadastro, login, /me
        ├── users/                  # Perfil, busca por SeloKey, score-events
        ├── wallet/                 # Saldo, transações, Pix de depósito
        ├── agreements/             # Máquina de estados completa dos acordos
        ├── disputes/               # Contestações, evidências, respostas
        ├── admin/                  # Portal admin, dashboard, decisões
        ├── score/                  # ScoreService — registra eventos e atualiza score
        ├── blockchain/             # BlockchainService — registra eventos SHA256
        └── virtual-card/           # Cartão virtual com limite dinâmico por score
```

Cada módulo segue o padrão NestJS: um arquivo `.module.ts` (registro), um `.controller.ts` (rotas HTTP), um `.service.ts` (lógica de negócio) e um diretório `dto/` (Data Transfer Objects com validações via `class-validator`).

### Configurações globais (main.ts)

O arquivo `main.ts` configura o bootstrap da aplicação com as seguintes opções:

- **Prefixo global:** Todos os endpoints recebem o prefixo `/api`.
- **ValidationPipe global:** Valida automaticamente todos os DTOs de entrada usando `class-validator`, rejeitando propriedades não declaradas (`whitelist: true`) e retornando erro 400 para dados inválidos.
- **Swagger:** Documentação automática disponível em `/docs`, com suporte a autenticação Bearer para testes autenticados.
- **CORS:** Configurado para aceitar requisições de origens específicas.
- **ThrottlerModule:** Rate limiting de 60 requisições por minuto por IP.

---

## 5.4 Aplicativo Mobile

O aplicativo mobile do SeloPay foi desenvolvido com **Expo 54** e **React Native 0.81.5**, utilizando **Expo Router 6** como sistema de roteamento baseado em estrutura de arquivos — similar ao Next.js para web.

### Estrutura do aplicativo mobile

```
apps/mobile/
├── app/
│   ├── _layout.tsx                 # Layout raiz — providers de contexto
│   ├── index.tsx                   # Redirect inteligente (autenticado → tabs; guest → auth)
│   ├── (auth)/                     # Telas de autenticação (welcome, login, register)
│   ├── (tabs)/                     # Abas principais (home, wallet, agreements, profile)
│   ├── (admin)/                    # Telas administrativas (disputes, dispute/[id])
│   ├── agreements/                 # Telas de acordos (create, [id])
│   ├── deposit.tsx                 # Depósito Pix na carteira
│   ├── deposit-pix.tsx             # Depósito Pix como garantia de acordo
│   ├── score.tsx                   # Score e histórico de reputação
│   ├── virtual-card.tsx            # Cartão virtual SeloPay
│   ├── blockchain-proof.tsx        # Cadeia de hashes do acordo
│   └── notifications.tsx           # Notificações internas
└── src/
    ├── contexts/
    │   ├── AuthContext.tsx          # Autenticação de usuário (JWT, estado global)
    │   ├── AdminAuthContext.tsx     # Autenticação de administrador
    │   └── NotificationsContext.tsx # Contagem de não lidas e lista de notificações
    ├── services/
    │   └── api.ts                  # Instância Axios com interceptores
    ├── types/
    │   └── index.ts                # Tipos TypeScript globais compartilhados
    ├── theme/
    │   └── index.ts                # Cores, tipografia, espaçamentos, raios e sombras
    ├── utils/
    │   └── formatters.ts           # Formatação de moeda, data e CPF
    └── components/
        ├── ui/                     # Button, Input, Card, LoadingScreen
        ├── FloatingTabBar.tsx      # Barra de navegação flutuante
        ├── ScoreGauge.tsx          # Gauge visual do score
        └── SeloPayLogo.tsx         # Logotipo do sistema
```

O Expo Router utiliza o sistema de arquivos para definir as rotas: arquivos dentro de `(auth)/` são rotas de autenticação, `(tabs)/` são as abas principais e `(admin)/` são as telas do painel administrativo. O arquivo `_layout.tsx` envolve todas as rotas com os provedores de contexto necessários.

A comunicação com a API é feita por meio de uma instância Axios configurada em `src/services/api.ts`, com interceptores que incluem automaticamente o token JWT nos cabeçalhos `Authorization` e tratam respostas 401 com logout automático.

### Identidade visual

O SeloPay tem identidade visual própria, com paleta de cores definida em `src/theme/index.ts`:

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#0A4F5E` | Cor principal — cabeçalhos, botões primários |
| Secondary | `#12919F` | Destaques e elementos secundários |
| Accent | `#E8931E` | Avisos e atenção |
| Background | `#F3F6FA` | Fundo das telas |
| Surface | `#FFFFFF` | Cartões e superfícies |
| Error | `#E84040` | Erros e ações destrutivas |
| Success | `#27AE60` | Confirmações e status positivos |

---

## 5.5 Painel Administrativo

O painel administrativo do SeloPay é implementado como um conjunto de telas no próprio aplicativo mobile, sob o diretório `app/(admin)/`. Essa abordagem evita a necessidade de uma aplicação web separada, concentrando toda a interface em um único aplicativo mobile.

O acesso ao painel é controlado pelo `AdminAuthContext`, que gerencia um JWT separado obtido via `POST /api/admin/auth/login`. Os guards de autenticação na API (`AdminJwtGuard`) verificam que o token apresentado foi assinado com o segredo de administrador (`ADMIN_JWT_SECRET`), distinto do segredo de usuário comum.

As telas administrativas implementadas são:

- **`(admin)/disputes.tsx`:** Lista de disputas ordenadas por urgência (`OPEN` → `UNDER_REVIEW` → `RESOLVED`), com filtro por status e indicador visual de pendência.

- **`(admin)/dispute/[id].tsx`:** Detalhe completo de uma disputa, incluindo dados do acordo, partes envolvidas, histórico de ações, evidências enviadas, respostas das partes e modal de registro de decisão com as três opções: `RELEASE_TO_RECEIVER`, `REFUND_TO_PAYER` e `PROPOSE_RENEGOTIATION`.

---

## 5.6 Banco de Dados

O banco de dados do SeloPay é um PostgreSQL 16 gerenciado por **Prisma ORM**. O schema Prisma define todas as entidades, enumerações, relacionamentos e constraints do sistema. A Figura 13 [AGUARDA DIAGRAMA ER] apresenta o diagrama entidade-relacionamento.

### Entidades principais

**Tabela 5 — Entidades do banco de dados**

| Entidade | Finalidade | Principais Campos | Relacionamentos |
|----------|-----------|-------------------|-----------------|
| `User` | Usuário do sistema | `id`, `name`, `cpf`, `cpfMasked`, `email`, `passwordHash`, `seloKey`, `score` | Wallet (1:1), Agreements (N), Disputes, ScoreEvents, VirtualCard |
| `Wallet` | Carteira digital do usuário | `availableBalance`, `blockedBalance`, `userId` | User (1:1), WalletTransactions |
| `WalletTransaction` | Movimentação da carteira | `type`, `amount`, `description`, `walletId`, `agreementId` | Wallet, Agreement |
| `Agreement` | Acordo digital entre partes | `type`, `status`, `financialStatus`, `amount`, `dueDate`, `payerId`, `receiverId` | User×2, Confirmations, Disputes, Negotiations, SimulatedPayment |
| `AgreementConfirmation` | Confirmação de cumprimento | `confirmationType`, `role`, `userId`, `agreementId` | Agreement, User |
| `Dispute` | Contestação de acordo | `title`, `description`, `status`, `adminDecision`, `adminNotes` | Agreement, User, Evidences, History, Responses |
| `DisputeEvidence` | Evidências da contestação | `fileName`, `fileUrl`, `fileType`, `uploadedBy` | Dispute |
| `DisputeHistory` | Histórico de ações na disputa | `action`, `performedBy`, `notes` | Dispute |
| `DisputeResponse` | Resposta da parte contestada | `message`, `authorId` | Dispute, User, Evidences |
| `Negotiation` | Proposta de renegociação | `proposedDueDate`, `payerAccepted`, `receiverAccepted`, `status` | Agreement, User |
| `SimulatedPayment` | Pagamento Pix simulado | `fakePixCode`, `fakeQrCode`, `status` | Agreement, User |
| `PixDeposit` | Depósito Pix na carteira | `amount`, `status`, `qrCodePayload`, `copyPasteCode` | User |
| `ScoreEvent` | Evento de reputação | `type`, `delta`, `description`, `userId`, `agreementId` | User |
| `BlockchainRecord` | Registro encadeado de eventos | `eventType`, `payload`, `previousHash`, `hash`, `txHash`, `status` | Agreement, User |
| `VirtualCard` | Cartão virtual baseado em score | `creditLimit`, `usedLimit`, `status`, `maskedNumber`, `holderName` | User, CardTransactions |
| `CardTransaction` | Transação do cartão virtual | `type`, `amount`, `description`, `cardId`, `agreementId` | VirtualCard, Agreement |
| `AdminUser` | Usuário administrador | `name`, `email`, `passwordHash` | — |

### Enumerações

O schema define 14 enumerações que controlam os estados e tipos do sistema:

- `AgreementType`: `GUARANTEED`
- `AgreementStatus`: `DRAFT`, `PENDING_ACCEPTANCE`, `EXPIRED`, `REJECTED`, `WAITING_DEPOSIT`, `ACTIVE`, `IN_NEGOTIATION`, `IN_DISPUTE`, `COMPLETED`, `CANCELLED`
- `FinancialStatus`: `NO_FINANCIAL_MOVEMENT`, `WAITING_SIMULATED_DEPOSIT`, `SIMULATED_PAYMENT_PROCESSING`, `SIMULATED_PAYMENT_CONFIRMED`, `VALUE_HELD`, `VALUE_LOCKED_BY_DISPUTE`, `VALUE_RELEASED`, `REFUND_PENDING`, `VALUE_REFUNDED`
- `AdminDecisionType`: `RELEASE_TO_RECEIVER`, `REFUND_TO_PAYER`, `PROPOSE_RENEGOTIATION`, `REQUEST_MORE_EVIDENCE`
- `DisputeStatus`: `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `CLOSED`
- `WalletTransactionType`: `SIMULATED_DEPOSIT`, `VALUE_HELD`, `VALUE_RELEASED`, `VALUE_RECEIVED`, `SIMULATED_REFUND`, `VALUE_LOCKED_BY_DISPUTE`, `DISPUTE_RESOLVED_RELEASE`, `DISPUTE_RESOLVED_REFUND`
- `BlockchainEventType`: 16 tipos cobrindo todo o ciclo de vida do acordo
- Demais enums: `NegotiationStatus`, `SimulatedPaymentStatus`, `PixDepositStatus`, `ScoreEventType`, `VirtualCardStatus`, `CardTransactionType`, `BlockchainRecordStatus`

---

## 5.7 APIs e Endpoints

A API do SeloPay expõe 35+ endpoints organizados em 8 módulos. Todos os endpoints, exceto os de autenticação e login de administrador, exigem JWT no cabeçalho `Authorization: Bearer <token>`.

**Tabela 6 — Endpoints da API REST**

| Método | Rota | Módulo | Finalidade |
|--------|------|--------|-----------|
| POST | `/api/auth/register` | auth | Cadastrar novo usuário |
| POST | `/api/auth/login` | auth | Autenticar usuário |
| GET | `/api/auth/me` | auth | Dados do usuário autenticado |
| GET | `/api/users/me` | users | Perfil completo do usuário |
| GET | `/api/users/by-key/:seloKey` | users | Buscar usuário por SeloKey |
| GET | `/api/users/:id` | users | Buscar usuário por ID |
| GET | `/api/users/:id/score-events` | users | Histórico de score (últimas 50) |
| GET | `/api/wallet` | wallet | Saldo disponível e bloqueado |
| GET | `/api/wallet/transactions` | wallet | Histórico de transações (últimas 100) |
| POST | `/api/wallet/deposits/pix` | wallet | Gerar Pix para depósito na carteira |
| POST | `/api/wallet/deposits/:id/simulate-confirm` | wallet | Confirmar Pix (demo) |
| POST | `/api/wallet/simulate-credit` | wallet | Adicionar saldo (apenas para demo) |
| POST | `/api/agreements` | agreements | Criar novo acordo |
| GET | `/api/agreements` | agreements | Listar acordos do usuário |
| GET | `/api/agreements/:id` | agreements | Detalhe do acordo |
| POST | `/api/agreements/:id/accept` | agreements | Recebedor aceita o acordo |
| POST | `/api/agreements/:id/reject` | agreements | Recebedor recusa o acordo |
| POST | `/api/agreements/:id/simulate-deposit` | agreements | Depósito de garantia via carteira |
| POST | `/api/agreements/:id/simulate-deposit-pix` | agreements | Depósito de garantia via Pix |
| POST | `/api/agreements/:id/simulate-deposit-card` | agreements | Depósito de garantia via cartão |
| POST | `/api/agreements/:id/confirm` | agreements | Confirmar cumprimento |
| POST | `/api/agreements/:id/negotiate` | agreements | Propor renegociação |
| POST | `/api/agreements/:id/negotiate/accept` | agreements | Aceitar renegociação |
| POST | `/api/agreements/:id/negotiate/reject` | agreements | Recusar renegociação |
| POST | `/api/disputes` | disputes | Abrir contestação |
| GET | `/api/disputes` | disputes | Listar disputas do usuário |
| GET | `/api/disputes/:id` | disputes | Detalhe da disputa |
| POST | `/api/disputes/:id/evidence` | disputes | Enviar evidências (upload) |
| POST | `/api/disputes/:id/respond` | disputes | Responder contestação |
| GET | `/api/virtual-card/me` | virtual-card | Dados do cartão virtual |
| POST | `/api/virtual-card/activate` | virtual-card | Ativar cartão |
| POST | `/api/virtual-card/recalculate-limit` | virtual-card | Recalcular limite pelo score |
| GET | `/api/virtual-card/transactions` | virtual-card | Histórico de transações do cartão |
| POST | `/api/admin/auth/login` | admin | Login do administrador |
| GET | `/api/admin/dashboard` | admin | Métricas gerais |
| GET | `/api/admin/users` | admin | Listar todos os usuários |
| GET | `/api/admin/agreements` | admin | Listar todos os acordos |
| GET | `/api/admin/disputes` | admin | Listar disputas (filtro por status) |
| GET | `/api/admin/disputes/:id` | admin | Detalhe completo da disputa |
| POST | `/api/admin/disputes/:id/decision` | admin | Registrar decisão |

---

## 5.8 Segurança e Autenticação

### Autenticação JWT com dois contextos

O SeloPay implementa dois contextos de autenticação completamente separados:

**Usuário comum:** Autenticado via `POST /api/auth/login`. O token é assinado com `JWT_SECRET` e expira conforme `JWT_EXPIRES_IN` (padrão: 7 dias). O guard `JwtAuthGuard` valida o token e injeta o usuário no contexto da requisição por meio do decorator `@CurrentUser()`.

**Administrador:** Autenticado via `POST /api/admin/auth/login`. O token é assinado com `ADMIN_JWT_SECRET` (distinto do segredo de usuário) e expira conforme `ADMIN_JWT_EXPIRES_IN` (padrão: 1 dia). O guard `AdminJwtGuard` valida o token e verifica o campo `isAdmin: true` no payload.

Essa separação de contextos garante que um token de usuário comum nunca pode ser utilizado para acessar rotas administrativas, mesmo que o payload seja manipulado.

### Segurança adicional

- **Senhas com bcrypt:** Todas as senhas são armazenadas como hash bcrypt com salt 10. A verificação é feita com `bcrypt.compare`, nunca expondo o hash original.
- **Mascaramento de CPF:** O campo `cpf` (CPF completo) nunca é incluído nos campos selecionados para respostas. Apenas `cpfMasked` (formato `111.***.***-44`) é retornado.
- **Validação de DTOs:** O `ValidationPipe` global rejeita requisições com dados ausentes, inválidos ou propriedades extras (`whitelist: true, forbidNonWhitelisted: true`).
- **Rate limiting:** O `ThrottlerModule` limita a 60 requisições por minuto por IP, mitigando ataques de força bruta.
- **Isolamento de recursos:** A verificação de propriedade dos recursos (ex: somente o recebedor pode aceitar um acordo) é feita na camada de serviço, comparando o `userId` do JWT com os campos `payerId` e `receiverId` do acordo.

---

## 5.9 Rastreabilidade e Registros

### Blockchain interno simulado

O `BlockchainService` é um serviço global do NestJS injetado em múltiplos módulos. Ao ser chamado com `registerEvent({ agreementId, eventType, payload })`, ele:

1. Consulta o hash do último `BlockchainRecord` do mesmo acordo (`previousHash`).
2. Calcula o `hash` SHA256 da concatenação: `previousHash + eventType + JSON.stringify(payload)`.
3. Gera um `txHash` no formato `SELO` + 16 caracteres hexadecimais aleatórios.
4. Persiste o `BlockchainRecord` com status `CONFIRMED`.

Esse mecanismo cria uma cadeia verificável: qualquer alteração em um registro histórico invalida o hash de todos os registros subsequentes, tornando adulterações detectáveis. Embora centralizado (não distribuído), o mecanismo demonstra o conceito fundamental de imutabilidade por encadeamento criptográfico.

Os 16 tipos de eventos registrados cobrem todo o ciclo de vida do acordo: criação, aceite, rejeição, cancelamento, conclusão, depósitos, liberação, reembolso, disputa, decisões administrativas, renegociação e operações de cartão.

### Score de reputação

O `ScoreService` é chamado nos módulos `agreements`, `disputes` e `admin` sempre que um evento comportamental relevante ocorre. Ele atualiza o campo `user.score` diretamente (garantindo que não fique negativo) e persiste um `ScoreEvent` com o tipo, delta e descrição da ocorrência.

O campo `score` no modelo `User` é atualizado atomicamente como parte da mesma transação da operação que gerou o evento, garantindo consistência entre o score exibido e o histórico de eventos.
