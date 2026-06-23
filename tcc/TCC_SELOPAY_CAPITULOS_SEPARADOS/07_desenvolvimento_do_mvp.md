# CAPÍTULO 6 — DESENVOLVIMENTO DO MVP

## 6.1 Implementação dos Acordos Digitais

O núcleo do SeloPay é o módulo de acordos (`agreements`), que implementa uma máquina de estados para controlar o ciclo de vida de cada acordo. A máquina de estados define quais transições são permitidas a partir de cada estado e quais pré-condições devem ser satisfeitas para que cada transição ocorra.

O modelo de dados do acordo é definido no schema Prisma com dois campos de estado complementares: `status` (estado geral do acordo, do tipo `AgreementStatus`) e `financialStatus` (estado financeiro, do tipo `FinancialStatus`). Essa separação permite que o progresso do acordo e o progresso financeiro sejam rastreados de forma independente — um acordo pode estar `ACTIVE` (status) com `VALUE_LOCKED_BY_DISPUTE` (financialStatus) simultaneamente.

O `AgreementsService` é a classe central do módulo, concentrando toda a lógica de validação de estado, transições e operações financeiras simuladas. Cada método de transição valida explicitamente o estado atual antes de permitir a mudança, retornando `BadRequestException` se o estado atual não for compatível com a transição solicitada.

---

## 6.2 Implementação do Acordo Simples

O conceito de "acordo simples" no SeloPay refere-se a um acordo sem movimentação financeira bloqueada. Na implementação atual, o schema Prisma define apenas o tipo `GUARANTEED` no enum `AgreementType`. A distinção entre acordos simples e acordos com garantia é tratada no nível do fluxo: um acordo criado com valor zero ou no qual o depósito de garantia nunca é realizado permanece registrado sem bloquear nenhum saldo.

Essa abordagem funciona porque a lógica de liberação do valor verifica o `financialStatus` antes de executar qualquer operação financeira: se o `financialStatus` for `NO_FINANCIAL_MOVEMENT`, as operações de saldo são ignoradas e o acordo é encerrado como `COMPLETED` sem movimentação.

Para trabalhos futuros, seria recomendável introduzir um segundo valor no enum `AgreementType` — por exemplo, `SIMPLE` — para tornar explícita no schema a distinção entre os dois tipos de acordo, permitindo validações mais precisas e relatórios mais claros no painel administrativo.

---

## 6.3 Implementação do Acordo com Garantia

O acordo com garantia é o fluxo central do SeloPay. Após o aceite pelo recebedor, o acordo entra em `WAITING_DEPOSIT` e aguarda que o pagador deposite o valor combinado por uma das três fontes disponíveis.

### Depósito via carteira interna

O método `simulateDeposit` verifica se o pagador tem `availableBalance >= amount` na carteira. Em caso afirmativo, executa uma transação atômica do Prisma (`$transaction`) que:

1. Decrementa `availableBalance` da carteira do pagador no valor do acordo.
2. Incrementa `blockedBalance` da carteira do pagador no mesmo valor.
3. Cria um `WalletTransaction` do tipo `VALUE_HELD`.
4. Atualiza o acordo para `status = ACTIVE` e `financialStatus = VALUE_HELD`.
5. Atualiza o `SimulatedPayment` para `status = CONFIRMED`.

O uso de `$transaction` do Prisma garante que ou todas as operações são realizadas com sucesso ou nenhuma delas é persistida, evitando estados inconsistentes no banco de dados.

### Depósito via Pix simulado

O método `simulateDepositPix` não verifica o saldo da carteira, simulando um pagamento externo. Ao ser chamado, cria um `SimulatedPayment` com `fakePixCode` e `fakeQrCode` (URLs e códigos fictícios) e atualiza o `financialStatus` para `SIMULATED_PAYMENT_PROCESSING`. A confirmação do pagamento é feita manualmente via endpoint de demo, que então incrementa o `blockedBalance` do pagador e atualiza o acordo para `ACTIVE`.

### Depósito via cartão virtual

O método `simulateDepositCard` verifica se o usuário tem um cartão ativo com limite disponível suficiente (`creditLimit - usedLimit >= amount`). Em caso afirmativo, cria um `CardTransaction` do tipo `GUARANTEE_BLOCK`, incrementa `usedLimit` do cartão e atualiza o acordo para `ACTIVE`. O `blockedBalance` da carteira não é alterado neste caso — a garantia está no limite do cartão, não no saldo da carteira.

---

## 6.4 Implementação da Carteira

A carteira digital (`Wallet`) é criada automaticamente no cadastro do usuário pelo `AuthService`, junto ao registro do `User`. A criação é feita em uma única operação usando a sintaxe de criação aninhada do Prisma:

```typescript
await prisma.user.create({
  data: {
    ...userData,
    wallet: { create: { availableBalance: 0, blockedBalance: 0 } }
  }
})
```

O `WalletService` expõe operações para consultar o saldo atual, obter o histórico de transações (limitado às últimas 100) e gerar depósitos via Pix simulado. O endpoint `POST /wallet/simulate-credit` adiciona saldo diretamente ao `availableBalance` do usuário, sendo um atalho de demonstração que simula o recebimento de um depósito externo confirmado.

Todas as operações que alteram o saldo (`blockedBalance` ou `availableBalance`) registram automaticamente um `WalletTransaction` com o tipo correspondente, garantindo que o histórico seja sempre consistente com o saldo atual.

---

## 6.5 Implementação do Pix Simulado

O SeloPay implementa dois fluxos de Pix simulado distintos:

**Pix para depósito na carteira (`POST /wallet/deposits/pix`):** Cria um `PixDeposit` com `qrCodePayload` (URL fictícia simulando o QR Code) e `copyPasteCode` (código copia-e-cola fictício), com expiração de 30 minutos. A tela `deposit.tsx` no mobile exibe essas informações ao usuário. A confirmação é feita manualmente via `POST /wallet/deposits/:id/simulate-confirm`, que muda o status do depósito para `CONFIRMED` e incrementa o `availableBalance` do usuário.

**Pix como garantia de acordo (`POST /agreements/:id/simulate-deposit-pix`):** Cria um `SimulatedPayment` com `fakePixCode` e `fakeQrCode`. A tela `deposit-pix.tsx` exibe o QR Code e o código ao usuário. A confirmação da garantia procede via endpoint de simulação que bloqueia o valor na carteira.

Em ambos os casos, os dados exibidos ao usuário são completamente fictícios — não há QR Code real, não há chave Pix registrada e não há integração com o Sistema de Pagamentos Instantâneos do Banco Central. Essa limitação está claramente documentada e seria o principal ponto de evolução do sistema em uma versão de produção.

---

## 6.6 Implementação da Dupla Confirmação

A dupla confirmação é o mecanismo central de proteção do pagador e do recebedor em acordos com garantia. O método `confirmAgreement` do `AgreementsService` recebe o `userId` do solicitante e o `confirmationType` informado.

A lógica de validação segue os seguintes passos:

1. Verifica que o acordo está em `ACTIVE`.
2. Identifica o papel do solicitante (pagador → `OBLIGATION_FULFILLED`; recebedor → `READY_TO_RECEIVE`).
3. Verifica que o tipo de confirmação informado é compatível com o papel do solicitante.
4. Verifica que o solicitante ainda não confirmou (evita dupla confirmação pelo mesmo usuário).
5. Cria o `AgreementConfirmation`.
6. Conta quantas confirmações o acordo possui agora.
7. Se dois — executa a liberação em transação atômica.

A liberação em transação atômica inclui:

- Decrementar `blockedBalance` do pagador no valor do acordo.
- Incrementar `availableBalance` do recebedor no mesmo valor.
- Criar `WalletTransaction` do tipo `VALUE_RELEASED` para o pagador.
- Criar `WalletTransaction` do tipo `VALUE_RECEIVED` para o recebedor.
- Atualizar o acordo para `status = COMPLETED`, `financialStatus = VALUE_RELEASED`, `completedAt = now()`.
- Registrar eventos de score para ambos os participantes (+5 — `AGREEMENT_COMPLETED`).
- Registrar evento blockchain `VALUE_RELEASED` e `AGREEMENT_COMPLETED`.

---

## 6.7 Implementação das Disputas

O módulo de disputas (`disputes`) permite que qualquer participante de um acordo ativo abra uma contestação formal. O `DisputesService` é responsável pela criação da disputa, validação de participação, recepção de evidências e registro de respostas.

### Abertura de disputa

Ao criar uma disputa, o serviço verifica que:
- O solicitante é pagador ou recebedor do acordo.
- O acordo está em `ACTIVE` ou `IN_NEGOTIATION`.
- Não há outra disputa já aberta para o mesmo acordo.

Em seguida, executa em transação:
1. Cria o `Dispute` com status `OPEN`.
2. Atualiza o acordo para `status = IN_DISPUTE`.
3. Se o acordo for `GUARANTEED`, atualiza `financialStatus = VALUE_LOCKED_BY_DISPUTE`.
4. Registra evento de score para o usuário contestado (-5 — `DISPUTE_OPENED_AGAINST_USER`).
5. Registra evento blockchain `DISPUTE_OPENED`.

### Envio de evidências

O upload de evidências é feito via `POST /disputes/:id/evidence` com requisição `multipart/form-data`. O middleware `multer` processa o arquivo, que é armazenado no sistema de arquivos local do servidor (diretório `/uploads`). O registro `DisputeEvidence` armazena o nome do arquivo, o caminho e o tipo MIME.

Essa abordagem de armazenamento local é adequada para o MVP, mas seria substituída por um serviço de armazenamento em nuvem (ex: AWS S3) em uma versão de produção.

### Resposta à contestação

A parte contestada pode responder via `POST /disputes/:id/respond` com uma mensagem e evidências opcionais. O serviço verifica que o solicitante é participante do acordo e cria o `DisputeResponse` com as evidências associadas.

### Resolução pelo administrador

O `AdminService.resolveDispute()` recebe a decisão do administrador e executa a lógica correspondente. Cada decisão é implementada em um método privado separado (`executeReleaseToReceiver`, `executeRefundToPayer`, `executeRenegotiation`), mantendo o método principal legível e cada fluxo de resolução isolado.

A resolução leva em conta a fonte da garantia: se o depósito foi via cartão, a liberação credita a carteira do recebedor e registra `GUARANTEE_SETTLE` no cartão; o reembolso devolve o limite ao cartão registrando `GUARANTEE_RELEASE`. Se o depósito foi via carteira ou Pix simulado, as operações envolvem os saldos `blockedBalance` e `availableBalance` do pagador.

---

## 6.8 Implementação de Histórico, Reputação e Score

### Score comportamental

O `ScoreService` é um serviço global com um único método público:

```typescript
async recordEvent(userId: string, type: ScoreEventType, description: string, agreementId?: string)
```

Internamente, o método calcula o delta correspondente ao tipo de evento, persiste um `ScoreEvent` e executa um `UPDATE` atômico no campo `user.score`, aplicando a restrição de mínimo zero:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: { score: { increment: delta } }
})
// Garantia de mínimo: segundo update se score resultante < 0
```

### Tabela de deltas por evento

| Tipo de Evento | Delta |
|---------------|-------|
| `AGREEMENT_COMPLETED` | +5 |
| `DISPUTE_WON` | +5 |
| `AGREEMENT_DISPUTED_RESOLVED` | +3 |
| `RENEGOTIATION_ACCEPTED` | +2 |
| `DISPUTE_OPENED_AGAINST_USER` | -5 |
| `DISPUTE_LOST` | -10 |
| `LATE_PAYMENT` | -3 |
| `AGREEMENT_DEFAULTED` | -15 |

---

## 6.9 Implementação do Blockchain Interno

O `BlockchainService` é outro serviço global injetado em múltiplos módulos. Sua implementação é assíncrona e não bloqueante — os módulos chamadores executam `.catch(() => {})` após o registro, garantindo que uma falha no blockchain nunca interrompa o fluxo principal do negócio.

A lógica de encadeamento:

```typescript
async registerEvent({ agreementId, eventType, payload }) {
  const last = await prisma.blockchainRecord.findFirst({
    where: { agreementId },
    orderBy: { createdAt: 'desc' }
  });
  const previousHash = last?.hash ?? '0'.repeat(64);
  const dataToHash = previousHash + eventType + JSON.stringify(payload);
  const hash = createHash('sha256').update(dataToHash).digest('hex');
  const txHash = 'SELO' + randomBytes(8).toString('hex').toUpperCase();
  
  await prisma.blockchainRecord.create({
    data: { agreementId, eventType, payload, previousHash, hash, txHash, status: 'CONFIRMED' }
  });
}
```

O hash inicial (quando não há registro anterior) é representado por 64 zeros, convencional em implementações de blockchain acadêmicas.

---

## 6.10 Cartão Virtual Baseado em Confiança

O `VirtualCardService` implementa a ativação e gestão do cartão virtual. O cálculo do limite é baseado em faixas de score:

```typescript
function calculateLimit(score: number): number {
  if (score < 300) return 0;
  if (score < 500) return 50;
  if (score < 700) return 150;
  if (score < 850) return 300;
  return 500;
}
```

O cartão é criado com número mascarado no formato `**** **** **** XXXX` (últimos 4 dígitos aleatórios), nome do titular, data de expiração (2 anos a partir da ativação) e limite calculado pelo score atual.

O endpoint `POST /virtual-card/recalculate-limit` permite recalcular o limite após mudanças no score, atualizando o campo `creditLimit` do cartão. O campo `usedLimit` não é alterado por esse endpoint — apenas a capacidade disponível muda conforme o novo limite calculado.

A tela `virtual-card.tsx` no mobile exibe todas as informações do cartão, incluindo o limite disponível (`creditLimit - usedLimit`), o histórico de transações e os botões de ativação ou recálculo. O design visual segue o estilo de aplicativos de banco digital, com o cartão exibido em formato de card com gradiente nas cores primárias do SeloPay.
