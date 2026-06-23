# SeloPay — Progresso do Projeto

> **Projeto:** TCC — Fintech simulada de acordos digitais  
> **Última atualização:** 2026-06-07  
> **Branch:** dev

---

## Estado Atual

| Componente       | Status       | Localização                          |
|------------------|--------------|--------------------------------------|
| API NestJS       | ✅ Concluída | `apps/api/`                          |
| Banco / Prisma   | ✅ Concluído | `apps/api/prisma/`                   |
| Seed de dados    | ✅ Concluído | `apps/api/prisma/seed.ts`            |
| App Mobile Expo  | 🟡 Fase 6 concluída | `apps/mobile/`              |
| Portal Admin Web | ⏳ Pendente         | `apps/admin/` (Fase 10)     |

---

## Fases Concluídas

### Fase 1 — Setup do Monorepo
- `pnpm-workspace.yaml` com 3 apps + 1 package
- `docker-compose.yml` com PostgreSQL 16 na porta 5435
- `.env.example` com variáveis documentadas
- `.gitignore` configurado
- `apps/api/package.json` com todas as dependências NestJS
- `apps/api/tsconfig.json` (CommonJS, ES2021, paths)

### Fase 1 — Prisma Schema Completo
Arquivo: `apps/api/prisma/schema.prisma`

**13 models:**
- `User` — cpf, cpfMasked, seloKey único, score, relações
- `Wallet` — availableBalance, blockedBalance (1:1 com User)
- `WalletTransaction` — tipo, valor, descrição, agreementId opcional
- `Agreement` — type, status, financialStatus, expiresAt, acceptedAt, completedAt
- `AgreementConfirmation` — role, confirmationType
- `Dispute` — title, description, adminDecision, adminNotes, resolvedAt
- `DisputeEvidence` — fileName, fileUrl (simulado), fileType
- `DisputeHistory` — action, performedBy, notes
- `Negotiation` — proposedDueDate, proposedById, payerAccepted, receiverAccepted, status
- `SimulatedPayment` — fakePixCode, fakeQrCode, status, confirmedAt
- `ScoreEvent` — type, delta, description, agreementId
- `AdminUser` — separado de User, JWT próprio

**Enums principais:**
- `AgreementType`: SIMPLE | GUARANTEED
- `AgreementStatus`: DRAFT | PENDING_ACCEPTANCE | EXPIRED | REJECTED | WAITING_DEPOSIT | ACTIVE | IN_NEGOTIATION | IN_DISPUTE | COMPLETED | CANCELLED
- `FinancialStatus`: NO_FINANCIAL_MOVEMENT | WAITING_SIMULATED_DEPOSIT | SIMULATED_PAYMENT_PROCESSING | SIMULATED_PAYMENT_CONFIRMED | VALUE_HELD | VALUE_LOCKED_BY_DISPUTE | VALUE_RELEASED | REFUND_PENDING | VALUE_REFUNDED
- `WalletTransactionType`: SIMULATED_DEPOSIT | VALUE_HELD | VALUE_RELEASED | VALUE_RECEIVED | SIMULATED_REFUND | VALUE_LOCKED_BY_DISPUTE | DISPUTE_RESOLVED_RELEASE | DISPUTE_RESOLVED_REFUND
- `ScoreEventType`: AGREEMENT_COMPLETED | AGREEMENT_DISPUTED_RESOLVED | AGREEMENT_DEFAULTED | DISPUTE_OPENED_AGAINST_USER | DISPUTE_WON | DISPUTE_LOST | RENEGOTIATION_ACCEPTED | LATE_PAYMENT

### Fase 1 — Seed de Demonstração
**Arquivo:** `apps/api/prisma/seed.ts`

Dados criados pelo seed:
| Entidade     | Detalhes |
|--------------|----------|
| AdminUser    | admin@selopay.com / Admin@123 |
| Usuário demo | erika@demo.com / Demo@123 / seloKey: @erika321 / saldo: R$1200 |
| Usuário demo | carlos@demo.com / Demo@123 / seloKey: @carlos456 / saldo: R$850 |
| Usuário demo | mariana@demo.com / Demo@123 / seloKey: @mariana789 / saldo: R$300 |
| Acordos      | 1 Simples ativo, 1 Simples pendente, 1 Garantia ativo (VALUE_HELD), 1 Garantia aguardando depósito, 1 Simples em disputa, 1 Garantia em disputa (VALUE_LOCKED), 1 Garantia concluído |

### Fase 2 — API NestJS Completa
**41 arquivos TypeScript** · build limpo sem erros

**Módulos implementados:**
- `PrismaModule` (global)
- `ScoreModule` (global, injetável em todos)
- `AuthModule` — register, login, me, JWT, seloKey auto-gerada, Wallet criada no cadastro
- `UsersModule` — findById, findBySeloKey, scoreEvents
- `WalletModule` — getWallet, getTransactions, simulateCredit
- `AgreementsModule` — máquina de estados completa
- `DisputesModule` — create, list, detail, addEvidence
- `AdminModule` — login separado, dashboard, resolução de disputas

---

## Comandos Principais

```powershell
# Na raiz do projeto
docker compose up -d                        # Sobe PostgreSQL porta 5435

cd apps/api
pnpm install                               # Instala dependências
pnpm prisma generate                       # Gera Prisma Client
pnpm prisma migrate dev --name init        # Cria tabelas no banco
pnpm prisma db seed                        # Popula com dados demo
pnpm dev                                   # Inicia API em modo hot-reload
pnpm build                                 # Compila para produção
pnpm prisma studio                         # Interface visual do banco
```

---

## Todos os Endpoints da API

**Base URL:** `http://localhost:3333/api`  
**Swagger:** `http://localhost:3333/docs`

### Auth (público)
| Método | Rota              | Descrição              |
|--------|-------------------|------------------------|
| POST   | /auth/register    | Cadastrar usuário      |
| POST   | /auth/login       | Login                  |
| GET    | /auth/me          | Dados do usuário (JWT) |

### Users (JWT obrigatório)
| Método | Rota                        | Descrição                    |
|--------|-----------------------------|------------------------------|
| GET    | /users/me                   | Perfil do logado             |
| GET    | /users/by-key/:seloKey      | Buscar por chave SeloPay     |
| GET    | /users/:id                  | Buscar por ID                |
| GET    | /users/:id/score-events     | Histórico de score           |

### Wallet (JWT obrigatório)
| Método | Rota                       | Descrição                      |
|--------|----------------------------|--------------------------------|
| GET    | /wallet                    | Saldo disponível e bloqueado   |
| GET    | /wallet/transactions       | Histórico de movimentações     |
| POST   | /wallet/simulate-credit    | [Demo] Depositar saldo simulado|

### Agreements (JWT obrigatório)
| Método | Rota                               | Descrição                              |
|--------|------------------------------------|----------------------------------------|
| POST   | /agreements                        | Criar acordo (SIMPLE ou GUARANTEED)    |
| GET    | /agreements                        | Listar meus acordos (?status=)         |
| GET    | /agreements/:id                    | Detalhe do acordo                      |
| POST   | /agreements/:id/accept             | Recebedor aceita                       |
| POST   | /agreements/:id/reject             | Recebedor recusa                       |
| POST   | /agreements/:id/simulate-deposit   | Pagador simula depósito (GUARANTEED)   |
| POST   | /agreements/:id/confirm            | Confirmar cumprimento                  |
| POST   | /agreements/:id/negotiate          | Propor renegociação                    |
| POST   | /agreements/:id/negotiate/accept   | Aceitar renegociação                   |

### Disputes (JWT obrigatório)
| Método | Rota                       | Descrição                      |
|--------|----------------------------|--------------------------------|
| POST   | /disputes                  | Abrir contestação              |
| GET    | /disputes                  | Minhas contestações            |
| GET    | /disputes/:id              | Detalhe                        |
| POST   | /disputes/:id/evidence     | Anexar evidência (simulado)    |

### Admin (AdminJWT obrigatório)
| Método | Rota                            | Descrição                    |
|--------|---------------------------------|------------------------------|
| POST   | /admin/auth/login               | Login do administrador       |
| GET    | /admin/dashboard                | Métricas gerais              |
| GET    | /admin/users                    | Todos os usuários            |
| GET    | /admin/agreements               | Todos os acordos             |
| GET    | /admin/disputes                 | Todas as contestações        |
| GET    | /admin/disputes/:id             | Detalhe de contestação       |
| POST   | /admin/disputes/:id/decision    | Decisão administrativa       |

---

## Fluxos Validados com Sucesso

1. **Cadastro** → seloKey gerada automaticamente, wallet zerada criada junto
2. **Login** → JWT retornado, senha nunca exposta
3. **Consulta de carteira** → saldo disponível e bloqueado corretos
4. **Busca por seloKey** → CPF mascarado, sem hash
5. **Criação de Acordo Simples** → status PENDING_ACCEPTANCE, expiresAt +1h
6. **Aceite de Acordo Simples** → status ACTIVE, sem movimentação financeira
7. **Criação de Acordo com Garantia** → SimulatedPayment criado, fakePixCode gerado
8. **Aceite de Acordo com Garantia** → status WAITING_DEPOSIT
9. **Simulação de depósito** → availableBalance decrementado, blockedBalance incrementado, VALUE_HELD
10. **Confirmação única (pagador)** → registrada, acordo não concluído
11. **Dupla confirmação** → blockedBalance zerado, availableBalance do recebedor incrementado, COMPLETED, VALUE_RELEASED
12. **Abertura de contestação em GUARANTEED** → VALUE_LOCKED_BY_DISPUTE, IN_DISPUTE
13. **Decisão admin: RELEASE_TO_RECEIVER** → valor liberado ao recebedor, score atualizado
14. **Decisão admin: REFUND_TO_PAYER** → valor devolvido ao pagador, CANCELLED
15. **Depósito simulado de saldo** → endpoint `/wallet/simulate-credit` para demos

---

## Regras de Negócio Críticas

### Acordo Simples
- **NÃO movimenta saldo** — nunca. Nenhuma operação de carteira.
- Conclusão depende **apenas do recebedor** confirmar `PAYMENT_RECEIVED`
- Se pagador confirmar `PAYMENT_MADE` e recebedor não confirmar, **acordo não conclui**
- Após vencimento sem confirmação do recebedor → disputa possível

### Acordo com Garantia
- Valor só é movimentado após **aceite do recebedor** E **simulação do depósito**
- `availableBalance` do pagador ↓ / `blockedBalance` do pagador ↑ no momento do depósito
- Valor **não aparece em nenhuma carteira** como saldo disponível (está "guardado pela SeloPay")
- Liberação só ocorre quando **payer: OBLIGATION_FULFILLED** E **receiver: READY_TO_RECEIVE**
- Na liberação: `blockedBalance` do pagador ↓ / `availableBalance` do recebedor ↑
- Em contestação: `VALUE_LOCKED_BY_DISPUTE` — ninguém pode mover o valor
- Admin é o único que pode liberar, reembolsar ou propor renegociação de um acordo em disputa

### Geração de seloKey
- Padrão: `@firstname` + 6 hex chars em maiúsculo (ex: `@erika8F42KC`)
- Gerada no cadastro, imutável depois
- Única no sistema (verificação com retry x5)

### Score
- +5 por acordo concluído (ambas as partes)
- +5 por disputa ganha
- +2 por renegociação aceita
- -5 por disputa aberta contra o usuário
- -10 por disputa perdida
- -15 por inadimplência (AGREEMENT_DEFAULTED)
- -3 por pagamento atrasado

### JWT Separado
- Usuários comuns: `JWT_SECRET` / `jwt` strategy
- Admin: `ADMIN_JWT_SECRET` / `admin-jwt` strategy
- As estratégias são completamente independentes

---

## Bugs Corrigidos na Revisão Final (2026-06-07)

| # | Arquivo | Bug | Correção |
|---|---------|-----|----------|
| 1 | `admin.service.ts` | `executeRenegotiation` usava `adminId` (AdminUser.id) como `proposedById` em Negotiation — violação de FK | Usa `ag.payerId` como proposer com `payerAccepted: true`; recebedor ainda precisa aceitar |
| 2 | `agreements.service.ts` | `acceptNegotiation` não restaurava `financialStatus` após renegociação aceita em acordo GUARANTEED que estava `VALUE_LOCKED_BY_DISPUTE` | Restaura para `VALUE_HELD` quando `bothAccepted` e acordo era GUARANTEED em disputa |

---

## Arquitetura de Arquivos da API

```
apps/api/src/
├── main.ts                            # Bootstrap, CORS, ValidationPipe, Swagger
├── app.module.ts                      # Importa todos os módulos
├── prisma/
│   ├── prisma.service.ts              # PrismaClient com lifecycle hooks
│   └── prisma.module.ts               # Global, exportado para todos
├── common/
│   ├── constants/safe-user-select.ts  # Campos seguros para retornar User
│   ├── decorators/current-user.ts     # @CurrentUser() extrai req.user
│   ├── filters/http-exception.filter  # Tratamento global de erros
│   ├── guards/jwt-auth.guard.ts       # Guard usuário
│   └── guards/admin-jwt.guard.ts      # Guard admin
└── modules/
    ├── score/                         # ScoreService (global)
    ├── auth/                          # Register, Login, JWT Strategy
    ├── users/                         # findById, findBySeloKey
    ├── wallet/                        # Saldo, movimentações, depósito demo
    ├── agreements/                    # Máquina de estados dos acordos
    ├── disputes/                      # Contestações e evidências
    └── admin/                         # Portal admin com JWT separado
```

---

## Próximos Passos Recomendados

### Fase 6 — Mobile: Setup e Auth ✅ CONCLUÍDA (2026-06-07)
- [x] Criar `apps/mobile/` com Expo SDK 52 + TypeScript
- [x] Configurar tema SeloPay (`src/theme/index.ts` — paleta, tipografia, espaçamento, sombras)
- [x] Tela de Boas-Vindas (`app/(auth)/welcome.tsx`)
- [x] Tela de Login com demo hint (`app/(auth)/login.tsx`)
- [x] Tela de Cadastro com máscara de CPF (`app/(auth)/register.tsx`)
- [x] Navegação (Stack auth + Tab principal via Expo Router)
- [x] JWT salvo no SecureStore (`src/contexts/AuthContext.tsx`)
- [x] Conexão com `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- [x] Estrutura base Home, Wallet, Agreements, Profile (com dados reais da API)

**Arquitetura mobile:**
```
apps/mobile/
├── app/
│   ├── _layout.tsx           # Root layout com AuthProvider
│   ├── index.tsx             # Redirect baseado em auth
│   ├── (auth)/               # Telas públicas (welcome, login, register)
│   └── (tabs)/               # Telas autenticadas (home, wallet, agreements, profile)
└── src/
    ├── theme/index.ts        # Paleta SeloPay
    ├── types/index.ts        # Tipos TypeScript
    ├── services/api.ts       # Axios com interceptors
    ├── utils/formatters.ts   # Currency, date, status labels
    ├── contexts/AuthContext  # JWT + SecureStore
    └── components/ui/        # Button, Input, Card, LoadingScreen
```

**Para rodar:**
```powershell
cd apps/mobile
pnpm start          # Metro bundler
pnpm android        # Android emulator
pnpm ios            # iOS simulator
```

> **Nota:** A constante `API_BASE_URL` em `src/services/api.ts` usa `10.0.2.2:3333` para Android emulator.
> Para iOS Simulator, trocar por `localhost:3333`.

### Fase 7 — Mobile: Fluxo de Acordos (próxima)
- [ ] Tela de criação de acordo (tipo, buscar recebedor por seloKey, valor, data)
- [ ] Detalhe do acordo com ações contextuais (aceitar, recusar, depositar, confirmar)
- [ ] Tela de depósito simulado com QR fake
- [ ] Aceitar / recusar renegociação

### Fase 8 — Mobile: Fluxo de Acordos
- [ ] Criar acordo (tipo, buscar recebedor, valor, data, resumo)
- [ ] Detalhe do acordo com ações contextuais
- [ ] Aceitar / recusar acordo recebido
- [ ] Tela de depósito simulado (QR fake + botão "Simular pagamento")
- [ ] Confirmar cumprimento

### Fase 9 — Mobile: Disputa e Score
- [ ] Abrir contestação
- [ ] Detalhe da contestação
- [ ] Adicionar evidências (simulado)
- [ ] Tela de Score/Reputação
- [ ] Histórico de eventos de score

### Fase 10 — Admin Web (Next.js)
- [ ] Criar `apps/admin/` com Next.js 14 App Router
- [ ] Login admin
- [ ] Dashboard com métricas
- [ ] Lista e detalhe de contestações
- [ ] Interface para decisões (botões de ação)
- [ ] Lista de acordos e usuários

---

## Observações para o TCC

- Todo fluxo financeiro é **100% simulado** — sem Pix real, sem parceiro bancário
- `fakePixCode` e `fakeQrCode` são strings geradas internamente para demonstração visual
- `fileUrl` de evidências aponta para `fake-storage.selopay.com` (não existe)
- O score é calculado localmente e não tem valor legal
- O banco usa PostgreSQL local via Docker — não há produção
- JWT usa secrets configuráveis via `.env`
