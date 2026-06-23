# Arquitetura — SeloPay

Visão técnica da arquitetura, entidades e fluxos do sistema.

---

## Visão geral

O SeloPay é um **monorepo pnpm** com dois aplicativos principais:

```
Cliente (Mobile)
     │
     │  HTTP / REST (Axios + JWT)
     ▼
  API NestJS  ───►  PostgreSQL 16
  (porta 3333)       (porta 5435)
                     via Prisma ORM
```

---

## Backend — API NestJS

**Localização:** `apps/api/`
**Framework:** NestJS 10 + TypeScript
**Porta:** 3333 | Prefixo global: `/api` | Swagger: `/docs`

### Módulos

| Módulo | Responsabilidade |
|--------|----------------|
| `auth` | Cadastro, login, `/me` |
| `users` | Perfil, busca por SeloKey, histórico de score |
| `wallet` | Saldo, transações, Pix de depósito na carteira |
| `agreements` | Máquina de estados completa de acordos |
| `disputes` | Contestações, evidências, respostas |
| `admin` | Dashboard, listagem global, resolução de disputas |
| `score` | Serviço global de atualização de reputação |
| `blockchain` | Serviço global de registro encadeado SHA256 |
| `virtual-card` | Cartão virtual com limite por score |

### Configurações globais (main.ts)

- `ValidationPipe` com `whitelist: true` (rejeita campos extras)
- `HttpExceptionFilter` global para erros padronizados
- Swagger configurado com Bearer auth
- `ThrottlerModule`: 60 requisições por minuto por IP
- CORS configurado via `CORS_ORIGINS`

### Segurança

- Senhas com **bcrypt** (salt 10)
- JWT com dois contextos distintos: `JwtAuthGuard` (usuário) e `AdminJwtGuard` (admin)
- Segredos JWT separados: `JWT_SECRET` e `ADMIN_JWT_SECRET`
- CPF mascarado em todas as respostas da API
- Upload de evidências via `multer` (armazenamento local em `/uploads`)

---

## App Mobile — Expo + React Native

**Localização:** `apps/mobile/`
**Framework:** Expo 54 + React Native 0.81.5
**Roteamento:** Expo Router 6 (file-based, similar ao Next.js)

### Estrutura de rotas

```
app/
├── (auth)/         # Login, cadastro, boas-vindas
├── (tabs)/         # Tabs principais: home, wallet, agreements, profile
├── (admin)/        # Painel admin: lista de disputas, detalhe
├── agreements/     # Criar acordo, detalhe do acordo
├── deposit.tsx     # Pix de depósito na carteira
├── deposit-pix.tsx # Pix como garantia de acordo
├── score.tsx       # Score e histórico de reputação
├── virtual-card.tsx
├── blockchain-proof.tsx
└── notifications.tsx
```

### Contextos globais

| Contexto | Responsabilidade |
|----------|----------------|
| `AuthContext` | Autenticação do usuário — token JWT, dados do usuário |
| `AdminAuthContext` | Autenticação do administrador — JWT separado |
| `NotificationsContext` | Contagem e lista de notificações não lidas |

### Comunicação com a API

- **Axios** com instância configurada em `src/services/api.ts`
- Interceptor de request: adiciona `Authorization: Bearer <token>`
- Interceptor de response: trata 401 com logout automático
- URL base: `EXPO_PUBLIC_API_URL` (`.env`) | padrão: `http://localhost:3333/api`

---

## Banco de dados

**SGBD:** PostgreSQL 16
**ORM:** Prisma 5.9.1
**Migrations:** versionadas em `apps/api/prisma/migrations/`
**Schema:** `apps/api/prisma/schema.prisma`

### Entidades principais

#### User

Usuário do sistema. Criado no cadastro com SeloKey gerada automaticamente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | CUID | Identificador único |
| `name` | String | Nome completo |
| `cpf` | String (unique) | CPF — nunca exposto pela API |
| `cpfMasked` | String | CPF mascarado: `111.***.***-44` |
| `email` | String (unique) | E-mail |
| `passwordHash` | String | bcrypt |
| `seloKey` | String (unique) | Chave pública: `@nome6HEX` |
| `score` | Int (100) | Score de reputação |

#### Agreement

Acordo digital entre duas partes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | `AgreementType` | `GUARANTEED` |
| `status` | `AgreementStatus` | Estado geral (9 valores) |
| `financialStatus` | `FinancialStatus` | Estado financeiro (9 valores) |
| `amount` | Decimal | Valor do acordo |
| `payerId` / `receiverId` | String | Referências ao pagador e recebedor |
| `dueDate` | DateTime | Prazo de cumprimento |

**Estados do acordo (AgreementStatus):**

```
PENDING_ACCEPTANCE → WAITING_DEPOSIT → ACTIVE → COMPLETED
       │                                  │
       └─► REJECTED / EXPIRED             ├─► IN_NEGOTIATION
                                          └─► IN_DISPUTE → COMPLETED / CANCELLED
```

**Estados financeiros (FinancialStatus):**

```
NO_FINANCIAL_MOVEMENT
WAITING_SIMULATED_DEPOSIT
SIMULATED_PAYMENT_PROCESSING / CONFIRMED
VALUE_HELD                    ← depósito realizado
VALUE_LOCKED_BY_DISPUTE       ← contestação aberta
VALUE_RELEASED                ← dupla confirmação
VALUE_REFUNDED                ← reembolso
```

#### Wallet

Carteira digital do usuário (1:1 com User, criada no cadastro).

| Campo | Descrição |
|-------|-----------|
| `availableBalance` | Saldo livre |
| `blockedBalance` | Saldo comprometido com acordos ativos |

Toda movimentação registra um `WalletTransaction` com o tipo:
`SIMULATED_DEPOSIT` | `VALUE_HELD` | `VALUE_RELEASED` | `VALUE_RECEIVED` | `SIMULATED_REFUND` | `VALUE_LOCKED_BY_DISPUTE` | `DISPUTE_RESOLVED_RELEASE` | `DISPUTE_RESOLVED_REFUND`

#### Dispute

Contestação de um acordo.

| Campo | Descrição |
|-------|-----------|
| `status` | `OPEN` → `UNDER_REVIEW` → `RESOLVED` / `CLOSED` |
| `adminDecision` | `RELEASE_TO_RECEIVER` \| `REFUND_TO_PAYER` \| `PROPOSE_RENEGOTIATION` \| `REQUEST_MORE_EVIDENCE` |

Relacionamentos: `DisputeEvidence` (arquivos), `DisputeHistory` (log de ações), `DisputeResponse` (resposta da parte contestada).

#### BlockchainRecord

Registro encadeado de eventos.

| Campo | Descrição |
|-------|-----------|
| `eventType` | Tipo do evento (16+ tipos) |
| `payload` | JSON com dados do evento |
| `previousHash` | Hash do registro anterior (SHA256) |
| `hash` | SHA256 de `previousHash + eventType + payload` |
| `txHash` | `SELO` + 16 hex aleatórios |

#### ScoreEvent

Evento que altera o score do usuário.

| Tipo | Delta |
|------|-------|
| `AGREEMENT_COMPLETED` | +5 |
| `DISPUTE_WON` | +5 |
| `AGREEMENT_DISPUTED_RESOLVED` | +3 |
| `RENEGOTIATION_ACCEPTED` | +2 |
| `DISPUTE_OPENED_AGAINST_USER` | -5 |
| `DISPUTE_LOST` | -10 |
| `LATE_PAYMENT` | -3 |
| `AGREEMENT_DEFAULTED` | -15 |

#### VirtualCard

Cartão de crédito interno baseado em score.

| Faixa de score | Limite |
|---------------|--------|
| < 300 | R$ 0 (sem ativação) |
| 300 – 499 | R$ 50 |
| 500 – 699 | R$ 150 |
| 700 – 849 | R$ 300 |
| ≥ 850 | R$ 500 |

Tipos de transação: `GUARANTEE_BLOCK` | `GUARANTEE_RELEASE` | `GUARANTEE_SETTLE`

---

## Fluxos principais

### Acordo com garantia (caminho feliz)

```
Pagador cria acordo
       │
       ▼
PENDING_ACCEPTANCE ──(aceite)──► WAITING_DEPOSIT
                   ──(recusa)──► REJECTED
                   ──(timeout)─► EXPIRED
       │
(depósito: carteira / Pix / cartão)
       │
       ▼
     ACTIVE / VALUE_HELD
       │
  (pagador confirma OBLIGATION_FULFILLED)
  (recebedor confirma READY_TO_RECEIVE)
       │
       ▼
   COMPLETED / VALUE_RELEASED
   → blockedBalance payer -=amount
   → availableBalance receiver +=amount
   → score +5 ambos
```

### Fluxo de disputa

```
ACTIVE ──(contestação)──► IN_DISPUTE / VALUE_LOCKED_BY_DISPUTE
                                │
                          (evidências + resposta)
                                │
                         (decisão do admin)
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
      RELEASE_TO_RECEIVER  REFUND_TO_PAYER  PROPOSE_RENEGOTIATION
           COMPLETED          CANCELLED        IN_NEGOTIATION
       receiver +amount    payer +amount
          score -10/+5       score -10/+5
```

### Fluxo do blockchain interno

```
Evento ocorre (ex: acordo criado)
       │
       ▼
BlockchainService.registerEvent({agreementId, eventType, payload})
       │
       ├─ Busca último hash do acordo
       ├─ SHA256(previousHash + eventType + JSON(payload))
       ├─ txHash = "SELO" + 16hex aleatórios
       └─ Persiste BlockchainRecord
```

---

## Diferença entre simulação acadêmica e integração real

| Aspecto | MVP Acadêmico (atual) | Integração Real (futuro) |
|---------|----------------------|-------------------------|
| Pix | QR Code e código fictícios | Integração com PSP via API Pix (BCB) |
| Saldo | Valores em banco de dados | Custódia real em conta de pagamento |
| Blockchain | Hash SHA256 em PostgreSQL | Rede distribuída (Ethereum Sepolia / Hyperledger) |
| Cartão virtual | Limite interno no banco | Emissão via BaaS / processadora |
| KYC | CPF coletado sem validação | Verificação Receita Federal + biometria |
| Escrow | Bloqueio de saldo simulado | Conta escrow regulada pelo BCB |
| Regulatório | Sem conformidade | Autorização como IP (Lei 12.865/2013) |
