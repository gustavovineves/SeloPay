# API Reference — SeloPay

**Base URL:** `http://localhost:3333/api`
**Documentação interativa (Swagger):** `http://localhost:3333/docs`

Todos os endpoints com prefixo `/api` usam o prefixo global da API. A tabela abaixo omite `/api` para brevidade.

---

## Autenticação

A API usa dois contextos JWT separados:

| Contexto | Header | Obtido via |
|----------|--------|-----------|
| Usuário | `Authorization: Bearer <token>` | `POST /auth/login` |
| Admin | `Authorization: Bearer <admin_token>` | `POST /admin/auth/login` |

---

## Auth — `/auth`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/register` | Público | Cadastrar novo usuário |
| `POST` | `/auth/login` | Público | Login — retorna JWT |
| `GET` | `/auth/me` | Usuário | Dados do usuário autenticado |

### POST /auth/register

```json
{
  "name": "Érika Neves",
  "email": "erika@demo.com",
  "cpf": "12345678901",
  "password": "Demo@123"
}
```

Resposta: token JWT + dados do usuário (CPF mascarado, SeloKey gerada).

### POST /auth/login

```json
{
  "email": "erika@demo.com",
  "password": "Demo@123"
}
```

Resposta: `{ "access_token": "...", "user": { ... } }`

---

## Users — `/users`

Todas as rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users/me` | Perfil do usuário logado |
| `GET` | `/users/by-key/:seloKey` | Buscar usuário pela SeloKey (`@nome6HEX`) |
| `GET` | `/users/:id` | Buscar usuário por ID |
| `GET` | `/users/:id/score-events` | Histórico de eventos de score do usuário |

---

## Wallet — `/wallet`

Todas as rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/wallet` | Consultar carteira (saldo disponível e bloqueado) |
| `GET` | `/wallet/transactions` | Histórico de movimentações |
| `POST` | `/wallet/deposits/pix` | Gerar Pix de depósito na carteira |
| `POST` | `/wallet/deposits/:id/simulate-confirm` | [Demo] Confirmar pagamento Pix na carteira |
| `POST` | `/wallet/simulate-credit` | [Demo] Depositar saldo diretamente (sem Pix) |

### POST /wallet/deposits/pix

```json
{ "amount": 500 }
```

Retorna `{ "id": "...", "pixCode": "...", "qrCodeBase64": "...", "amount": 500 }` (fictício).

### POST /wallet/simulate-credit

```json
{ "amount": 500 }
```

Atalho de desenvolvimento para adicionar saldo sem passar pelo fluxo Pix.

---

## Agreements — `/agreements`

Todas as rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/agreements` | Criar acordo |
| `GET` | `/agreements` | Listar meus acordos (query: `?status=ACTIVE`) |
| `GET` | `/agreements/:id` | Detalhe de um acordo |
| `POST` | `/agreements/:id/accept` | Recebedor aceita o acordo |
| `POST` | `/agreements/:id/reject` | Recebedor recusa o acordo |
| `POST` | `/agreements/:id/simulate-deposit` | Depositar garantia via carteira interna |
| `POST` | `/agreements/:id/simulate-deposit-pix` | Depositar garantia via Pix simulado |
| `POST` | `/agreements/:id/simulate-deposit-card` | Depositar garantia via cartão virtual |
| `POST` | `/agreements/:id/confirm` | Confirmar cumprimento do acordo |
| `POST` | `/agreements/:id/negotiate` | Propor renegociação (nova data) |
| `POST` | `/agreements/:id/negotiate/accept` | Aceitar proposta de renegociação |
| `POST` | `/agreements/:id/negotiate/reject` | Recusar proposta de renegociação |

### POST /agreements

```json
{
  "receiverSeloKey": "@gustavo8C7D9E",
  "amount": 100.00,
  "description": "Serviço de design do site",
  "dueDate": "2026-07-01T00:00:00.000Z",
  "type": "GUARANTEED"
}
```

### POST /agreements/:id/confirm

Ambas as partes devem confirmar. O sistema verifica qual confirmação está sendo registrada:
- Pagador → `OBLIGATION_FULFILLED`
- Recebedor → `READY_TO_RECEIVE`

Quando ambas ocorrem, o valor é liberado automaticamente.

### POST /agreements/:id/negotiate

```json
{ "newDueDate": "2026-08-01T00:00:00.000Z" }
```

---

## Disputes — `/disputes`

Todas as rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/disputes` | Abrir contestação |
| `GET` | `/disputes` | Listar minhas contestações |
| `GET` | `/disputes/:id` | Detalhe de uma contestação |
| `POST` | `/disputes/:id/evidence` | Anexar evidência (multipart/form-data, máx. 10 arquivos) |
| `POST` | `/disputes/:id/respond` | Responder contestação (multipart/form-data) |

### POST /disputes

```json
{
  "agreementId": "cuid-do-acordo",
  "title": "Serviço não foi entregue conforme combinado",
  "description": "Descrição detalhada do problema..."
}
```

### POST /disputes/:id/evidence

`Content-Type: multipart/form-data`

Campo: `files` (arquivos de imagem, PDF, etc.)

### POST /disputes/:id/respond

`Content-Type: multipart/form-data`

Campos: `message` (texto, mínimo 10 caracteres) + `files` (opcional)

---

## Blockchain — `/agreements/:id/blockchain`

Rotas requerem JWT de usuário. O controller usa o mesmo prefixo `/agreements`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/agreements/:id/blockchain` | Cadeia de eventos blockchain do acordo |
| `GET` | `/agreements/:id/blockchain/verify` | Verificar integridade da cadeia (valida hashes) |

Resposta do `verify`: `{ "valid": true, "totalRecords": 7, "invalidAt": null }`

---

## Score — `/score`

Rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/score/me` | Score atual, tier, limite do cartão e histórico de eventos |

Resposta:
```json
{
  "score": 110,
  "tier": "Bronze",
  "cardLimit": 50,
  "events": [ ... ]
}
```

**Tiers:**

| Score | Tier | Limite do cartão |
|-------|------|----------------|
| < 300 | Sem tier | R$ 0 |
| 300–499 | Bronze | R$ 50 |
| 500–699 | Prata | R$ 150 |
| 700–849 | Ouro | R$ 300 |
| ≥ 850 | Platina | R$ 500 |

---

## Virtual Card — `/virtual-card`

Rotas requerem JWT de usuário.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/virtual-card/me` | Dados do cartão virtual (número mascarado, limite, saldo) |
| `POST` | `/virtual-card/activate` | Ativar cartão (requer score ≥ 300) |
| `GET` | `/virtual-card/transactions` | Histórico de transações do cartão |
| `POST` | `/virtual-card/recalculate-limit` | Recalcular limite com base no score atual |

---

## Admin — `/admin`

Rotas com `AdminJwt` requerem o token de administrador obtido via login admin.

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/admin/auth/login` | Público | Login do administrador |
| `GET` | `/admin/auth/me` | AdminJwt | Dados do admin autenticado |
| `GET` | `/admin/dashboard` | AdminJwt | Métricas gerais (usuários, acordos, disputas) |
| `GET` | `/admin/users` | AdminJwt | Listar todos os usuários |
| `GET` | `/admin/agreements` | AdminJwt | Listar todos os acordos |
| `GET` | `/admin/disputes` | AdminJwt | Listar disputas (query: `?status=OPEN`) |
| `GET` | `/admin/disputes/:id` | AdminJwt | Detalhe de uma disputa |
| `POST` | `/admin/disputes/:id/decision` | AdminJwt | Registrar decisão administrativa |

### POST /admin/auth/login

```json
{
  "email": "admin@selopay.com",
  "password": "Admin@123"
}
```

### POST /admin/disputes/:id/decision

```json
{
  "decision": "RELEASE_TO_RECEIVER",
  "adminNote": "Evidências comprovam entrega do serviço."
}
```

**Valores válidos para `decision`:**

| Valor | Efeito |
|-------|--------|
| `RELEASE_TO_RECEIVER` | Libera o valor bloqueado para o recebedor |
| `REFUND_TO_PAYER` | Reembolsa o valor para o pagador |
| `PROPOSE_RENEGOTIATION` | Reabre o acordo para renegociação de prazo |
| `REQUEST_MORE_EVIDENCE` | Solicita mais evidências (disputa continua aberta) |

---

## Códigos de resposta

| Código | Significado |
|--------|-------------|
| `200` | OK |
| `201` | Criado com sucesso |
| `400` | Dados inválidos / violação de regra de negócio |
| `401` | Não autenticado |
| `403` | Sem permissão para esta operação |
| `404` | Recurso não encontrado |
| `429` | Rate limit excedido (60 req/min por IP) |
| `500` | Erro interno do servidor |

Todos os erros seguem o formato:
```json
{
  "statusCode": 400,
  "message": "Acordo não pode ser aceito neste estado",
  "error": "Bad Request"
}
```
