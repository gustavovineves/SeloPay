# Roteiro de Demonstração — SeloPay

Guia passo a passo para demonstrar o SeloPay do zero, cobrindo os fluxos principais.

## Antes de começar

Garanta que o ambiente está rodando:

```bash
docker compose up -d          # Banco de dados
pnpm dev:api                  # API (porta 3333)
pnpm dev:mobile               # App mobile (Expo)
```

Resete os dados se necessário:

```bash
pnpm reset:demo
```

---

## Usuários disponíveis

| Usuário | E-mail | Senha | SeloKey |
|---------|--------|-------|---------|
| Érika Neves | `erika@demo.com` | `Demo@123` | `@erika3F2A1B` |
| Gustavo Neves | `gustavo@demo.com` | `Demo@123` | `@gustavo8C7D9E` |
| Admin | `admin@selopay.com` | `Admin@123` | — |

---

## Demo 1 — Acordo com Garantia (fluxo completo)

### Etapa 1 — Adicionar saldo (como Érika)

1. Faça login como Érika (`erika@demo.com` / `Demo@123`)
2. Vá para a aba **Carteira**
3. Toque em **Depositar** → gere um Pix simulado de R$ 500
4. Confirme o depósito (botão "Confirmar Pagamento Simulado")
5. Veja o saldo disponível atualizado: **R$ 500,00**

> Ou via Swagger: `POST /api/wallet/simulate-credit` com `{ "amount": 500 }`

### Etapa 2 — Criar acordo (como Érika, pagadora)

1. Ainda logada como Érika, vá para **Acordos** → **Novo Acordo**
2. Preencha:
   - SeloKey do recebedor: `@gustavo8C7D9E`
   - Valor: R$ 100,00
   - Descrição: "Pagamento pelo serviço de design do site"
   - Prazo: (qualquer data futura)
3. Confirme → acordo criado em **Aguardando aceite**

### Etapa 3 — Aceitar acordo (como Gustavo)

1. Faça login como Gustavo (`gustavo@demo.com` / `Demo@123`)
2. Na aba **Acordos**, o acordo aparece como pendente
3. Abra o detalhe e toque em **Aceitar acordo**
4. Acordo muda para **Aguardando depósito**

### Etapa 4 — Depositar garantia (como Érika)

1. Volte como Érika
2. No detalhe do acordo, escolha a fonte de depósito:
   - **Via carteira** (mais simples): usa o saldo disponível
   - **Via Pix simulado**: exibe QR Code fictício, confirmação manual
   - **Via cartão**: requer cartão ativo com limite suficiente
3. Confirme o depósito
4. Acordo muda para **Ativo** — valor bloqueado (R$ 100 saiu do `availableBalance` para `blockedBalance`)

### Etapa 5 — Confirmar conclusão (ambas as partes)

**Como Gustavo:**
1. Abra o acordo
2. Toque em **Confirmar recebimento** (READY_TO_RECEIVE)

**Como Érika:**
1. Abra o acordo
2. Toque em **Confirmar entrega** (OBLIGATION_FULFILLED)

### Etapa 6 — Verificar liberação

Após ambas as confirmações:
- Acordo muda para **Concluído**
- Saldo de Gustavo: `availableBalance += 100`
- Saldo de Érika: `blockedBalance -= 100`
- Score de ambos: +5 pontos
- Evento registrado no blockchain

---

## Demo 2 — Disputa e resolução administrativa

### Etapa 1 — Preparar um acordo ativo

Repita os passos 1–4 da Demo 1 para ter um acordo em status **Ativo**.

### Etapa 2 — Abrir contestação (como Gustavo)

1. Login como Gustavo, abra o acordo
2. Toque em **Contestar acordo**
3. Informe título e descrição da contestação
4. (Opcional) Faça upload de uma evidência (imagem, PDF)
5. Confirme

Resultado:
- Acordo → **Em disputa**
- `financialStatus` → `VALUE_LOCKED_BY_DISPUTE`
- Nenhuma das partes pode mover o valor

### Etapa 3 — Responder contestação (como Érika)

1. Login como Érika, abra o acordo/disputa
2. Toque em **Responder contestação**
3. Informe a mensagem de resposta
4. (Opcional) Faça upload de contra-evidência

### Etapa 4 — Resolver (como Admin)

1. Faça logout do usuário comum
2. Na tela de boas-vindas, acesse **Entrar como Admin**
3. Login: `admin@selopay.com` / `Admin@123`
4. Painel admin → lista de disputas → selecione a disputa
5. Analise evidências e histórico
6. Toque em **Registrar decisão** e escolha:
   - **Liberar para o recebedor** → Gustavo recebe o valor
   - **Reembolsar o pagador** → Érika recupera o valor
   - **Propor renegociação** → nova data de prazo

---

## Demo 3 — Score e Cartão Virtual

### Visualizar score (como Érika)

1. Login como Érika
2. Vá para **Perfil** → veja o score atual
3. Ou toque no indicador de score para ver o histórico detalhado

### Ativar cartão virtual

1. Na aba **Carteira**, toque em **Cartão SeloPay**
2. Se score ≥ 300: toque em **Ativar Cartão**
3. Limite calculado automaticamente pelo score:
   - Score 100 (inicial): **não ativável** (score < 300)
   - Score 300–499: **R$ 50**
   - Score 500–699: **R$ 150**
   - ...

> Para teste rápido do cartão, aumente o score manualmente via Prisma Studio ou via múltiplos acordos concluídos.

---

## Demo 4 — Blockchain / Prova de Acordo

1. Abra o detalhe de qualquer acordo concluído
2. Role até a seção **Prova Blockchain** (ou navegue para a tela dedicada)
3. Veja a cadeia de eventos com os hashes SHA256
4. Cada evento exibe: tipo, data, hash anterior, hash atual, txHash

---

## Demo 5 — Renegociação de prazo

1. Com um acordo em status **Ativo**, uma das partes propõe nova data
2. Acordo → **Em renegociação**
3. A outra parte aceita ou recusa
4. Se aceita: acordo retorna para **Ativo** com nova data
5. Se recusa: acordo retorna para **Ativo** com data original

---

## Verificar via Swagger

Acesse `http://localhost:3333/docs` para testar qualquer endpoint diretamente:

1. Clique em **Authorize** e cole o JWT obtido via login
2. Explore os endpoints agrupados por módulo

---

## Dicas para apresentação

- Use dois dispositivos/simuladores diferentes para Érika e Gustavo, ou mude de conta no mesmo dispositivo
- O Prisma Studio (`pnpm prisma:studio`) permite ver os dados do banco em tempo real enquanto você executa as ações
- O Swagger UI (`http://localhost:3333/docs`) é útil para demonstrar os endpoints da API
