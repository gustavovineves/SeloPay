# CAPÍTULO 4 — ANÁLISE E ESPECIFICAÇÃO DO SISTEMA

## 4.1 Visão Geral do SeloPay

O SeloPay é uma plataforma digital que permite a dois usuários formalizarem, acompanharem e resolverem acordos de forma estruturada. Em sua concepção, o sistema funciona como um intermediário de confiança digital: não é parte no acordo, não tem papel jurídico, mas oferece a infraestrutura técnica para que o acordo seja registrado, monitorado e, em caso de não cumprimento, contestado por meio de um processo interno.

O ciclo de vida de um acordo no SeloPay percorre os seguintes estágios: **criação** pelo pagador, **aceite ou recusa** pelo recebedor, **depósito simulado de garantia** pelo pagador (em acordos com garantia), **confirmação mútua de cumprimento**, **contestação** (quando há divergência) e **resolução** — seja pela confirmação das duas partes ou pela decisão do administrador em caso de disputa.

O sistema também disponibiliza funcionalidades complementares: carteira digital com histórico de transações, depósito via Pix simulado, cartão virtual com limite baseado em score, sistema de reputação e registro encadeado de eventos com hashes SHA256.

A Figura 11 [AGUARDA DIAGRAMA] apresenta o diagrama de estados do acordo, ilustrando todas as transições possíveis entre os estados do sistema.

---

## 4.2 Atores do Sistema

O SeloPay reconhece três atores principais:

**Usuário Pagador:** O usuário que cria o acordo e é identificado como responsável pelo pagamento da garantia (em acordos com garantia). O pagador informa a SeloKey do recebedor, o valor, a descrição e a data de vencimento. Após a criação do acordo, o pagador pode realizar o depósito de garantia, confirmar o cumprimento e contestar o acordo.

**Usuário Recebedor:** O usuário identificado pela SeloKey informada pelo pagador. O recebedor tem a opção de aceitar ou recusar o acordo. Após o aceite e o depósito da garantia, o recebedor pode confirmar que está pronto para receber o valor e contestar o acordo em caso de não cumprimento por parte do pagador.

**Administrador:** Usuário com acesso ao painel administrativo do SeloPay, com autenticação separada por JWT específico. O administrador não cria nem participa de acordos, mas tem acesso a todos os acordos, usuários e disputas do sistema. Sua função principal é analisar disputas abertas, ler as evidências submetidas por ambas as partes e registrar uma decisão final.

---

## 4.3 Requisitos Funcionais

A Tabela 2 apresenta os requisitos funcionais do sistema SeloPay, identificados durante a fase de análise e verificados no código-fonte do projeto.

**Tabela 2 — Requisitos Funcionais do Sistema**

| Código | Requisito | Descrição | Status |
|--------|-----------|-----------|--------|
| RF01 | Cadastro de usuário | O sistema deve permitir o cadastro com nome, CPF, e-mail e senha | Implementado |
| RF02 | Geração de SeloKey | O sistema deve gerar automaticamente uma chave pública única no formato `@nome6HEX` | Implementado |
| RF03 | Autenticação JWT | O sistema deve autenticar usuários com e-mail e senha, retornando JWT | Implementado |
| RF04 | Criação de carteira | O sistema deve criar automaticamente uma carteira digital no cadastro do usuário | Implementado |
| RF05 | Busca por SeloKey | O sistema deve permitir localizar usuários pela SeloKey | Implementado |
| RF06 | Criação de acordo | O sistema deve permitir a criação de acordos entre dois usuários distintos | Implementado |
| RF07 | Registro de termos | O sistema deve registrar partes, valor, descrição, prazo e data de criação do acordo | Implementado |
| RF08 | Aceite e recusa | O sistema deve permitir que o recebedor aceite ou recuse um acordo pendente | Implementado |
| RF09 | Expiração de acordo | Acordos em `PENDING_ACCEPTANCE` devem expirar após 1 hora | Implementado (on-demand) |
| RF10 | Depósito via carteira | O sistema deve aceitar depósito de garantia pelo saldo da carteira interna | Implementado |
| RF11 | Depósito via Pix | O sistema deve aceitar depósito de garantia via Pix simulado | Implementado |
| RF12 | Depósito via cartão | O sistema deve aceitar depósito de garantia via cartão virtual SeloPay | Implementado |
| RF13 | Bloqueio de saldo | O valor depositado como garantia deve ser bloqueado enquanto o acordo está ativo | Implementado |
| RF14 | Confirmação individual | O sistema deve permitir que cada parte registre a confirmação de cumprimento | Implementado |
| RF15 | Liberação por dupla confirmação | O valor só deve ser liberado quando ambas as partes confirmarem | Implementado |
| RF16 | Crédito ao recebedor | Após liberação, o valor deve ser creditado na carteira do recebedor | Implementado |
| RF17 | Abertura de contestação | O sistema deve permitir abertura de disputa por qualquer participante em acordo ativo | Implementado |
| RF18 | Travamento em disputa | O financialStatus deve mudar para VALUE_LOCKED_BY_DISPUTE ao abrir contestação | Implementado |
| RF19 | Envio de evidências | O sistema deve permitir upload de arquivos como evidência na contestação | Implementado |
| RF20 | Resposta à contestação | A parte contestada deve poder responder com mensagem e evidências | Implementado |
| RF21 | Painel administrativo | O sistema deve disponibilizar painel com autenticação separada para administradores | Implementado |
| RF22 | Consulta admin | O administrador deve visualizar disputas, usuários e acordos | Implementado |
| RF23 | Decisão admin | O administrador deve poder registrar decisão em disputas abertas | Implementado |
| RF24 | Registro de score | O sistema deve registrar eventos de reputação a cada ação relevante | Implementado |
| RF25 | Score do usuário | O sistema deve calcular e disponibilizar o score de confiança | Implementado |
| RF26 | Cartão virtual | O sistema deve disponibilizar cartão virtual com limite calculado pelo score | Implementado |
| RF27 | Blockchain interno | Eventos relevantes devem ser registrados em cadeia de hashes SHA256 | Implementado |
| RF28 | Depósito Pix na carteira | O sistema deve permitir depósito de saldo via Pix simulado | Implementado |
| RF29 | Histórico da carteira | O sistema deve disponibilizar histórico de transações da carteira | Implementado |
| RF30 | Renegociação | O sistema deve permitir proposição e aceite de nova data de vencimento | Implementado |
| RF31 | Validação de papel | O proponente de renegociação não deve poder aceitar sua própria proposta | Implementado |
| RF32 | Prova blockchain | O sistema deve disponibilizar tela de verificação dos eventos encadeados | Implementado |
| RF33 | Mascaramento de CPF | O CPF deve ser mascarado em todas as respostas da API | Implementado |
| RF34 | Notificações internas | O sistema deve disponibilizar notificações internas de eventos | Parcial |
| RF35 | Dashboard admin | O sistema deve disponibilizar painel de métricas ao administrador | Implementado |

---

## 4.4 Requisitos Não Funcionais

A Tabela 3 apresenta os requisitos não funcionais identificados e verificados no projeto.

**Tabela 3 — Requisitos Não Funcionais do Sistema**

| Código | Requisito | Descrição | Status |
|--------|-----------|-----------|--------|
| RNF01 | Segurança de senha | Senhas devem ser armazenadas com hash bcrypt (salt 10) | Implementado |
| RNF02 | Autenticação JWT | Autenticação baseada em JWT com expiração configurável (7 dias para usuário, 1 dia para admin) | Implementado |
| RNF03 | Privacidade do CPF | O CPF completo nunca deve ser retornado via API | Implementado |
| RNF04 | Rate limiting | A API deve limitar requisições a 60 por minuto por IP | Implementado |
| RNF05 | Validação de entrada | Dados fora das especificações dos DTOs devem ser rejeitados com erro 400 | Implementado |
| RNF06 | Transações atômicas | Operações financeiras críticas devem ser executadas em transações atômicas de banco de dados | Implementado |
| RNF07 | Documentação automática | A API deve disponibilizar documentação Swagger/OpenAPI | Implementado |
| RNF08 | Auditabilidade | Eventos críticos devem ser registrados em cadeia de hashes SHA256 | Implementado |
| RNF09 | Isolamento do banco | O banco de dados não deve ser exposto diretamente — somente acessado pela API | Implementado |
| RNF10 | CORS | A API deve configurar CORS para restringir origens | Implementado |
| RNF11 | Separação de contextos | JWTs de usuário e administrador devem usar secrets diferentes | Implementado |
| RNF12 | Execução com Docker | O sistema deve ser executável em ambiente de desenvolvimento com Docker | Implementado |
| RNF13 | Multiplataforma | O aplicativo mobile deve funcionar em iOS e Android | Implementado (React Native) |
| RNF14 | Token seguro | O JWT deve ser armazenado de forma segura no dispositivo (SecureStore) | Implementado |
| RNF15 | Erros padronizados | O sistema deve retornar erros HTTP padronizados e legíveis | Implementado |
| RNF16 | TypeScript estrito | O código deve ser escrito em TypeScript com tipagem estrita | Implementado |
| RNF17 | Monorepo | O projeto deve ser gerenciável com pnpm workspaces | Implementado |
| RNF18 | Extensibilidade | A arquitetura deve suportar adição de novos módulos independentes | Implementado (NestJS modular) |
| RNF19 | Testabilidade | A estrutura do projeto deve suportar testes automatizados | Parcial (Jest configurado) |
| RNF20 | Upload de arquivos | O upload de evidências deve suportar imagens e documentos | Implementado (multer) |

---

## 4.5 Regras de Negócio

As regras de negócio do SeloPay definem as restrições e comportamentos obrigatórios do sistema, independentemente da implementação técnica. As regras apresentadas a seguir foram verificadas diretamente no código-fonte do projeto.

**Acordos:**
- **RN01:** Somente usuários autenticados podem criar, visualizar ou interagir com acordos.
- **RN02:** O pagador (criador do acordo) não pode ser o mesmo que o recebedor.
- **RN03:** O recebedor é identificado pela SeloKey, não por CPF ou e-mail.
- **RN04:** Todo usuário recebe uma SeloKey única e imutável no cadastro.
- **RN05:** Acordos em `PENDING_ACCEPTANCE` expiram automaticamente se não respondidos em 1 hora.
- **RN06:** Apenas o recebedor pode aceitar ou recusar um acordo em `PENDING_ACCEPTANCE`.
- **RN07:** Após o aceite, o acordo com garantia exige depósito do pagador para passar a `ACTIVE`.
- **RN08:** O depósito via carteira exige `availableBalance >= amount`.
- **RN09:** O depósito via Pix simulado não verifica saldo — assume pagamento externo.
- **RN10:** O depósito via cartão exige que o cartão esteja ativo e que `(creditLimit - usedLimit) >= amount`.
- **RN11:** Após depósito, o valor fica em `blockedBalance` — não disponível para uso.
- **RN12:** O acordo registrado sem movimentação financeira não bloqueia nenhum saldo.
- **RN13:** A liberação do valor exige confirmação de ambas as partes: pagador e recebedor.
- **RN14:** O pagador confirma com tipo `OBLIGATION_FULFILLED`; o recebedor com `READY_TO_RECEIVE`.
- **RN15:** Somente após as duas confirmações o valor é transferido ao recebedor.

**Disputas:**
- **RN16:** Uma disputa só pode ser aberta em acordo com status `ACTIVE` ou `IN_NEGOTIATION`.
- **RN17:** Qualquer dos participantes pode abrir uma disputa.
- **RN18:** Ao abrir uma disputa em acordo com garantia, o `financialStatus` muda para `VALUE_LOCKED_BY_DISPUTE`.
- **RN19:** Nenhuma parte pode mover ou confirmar sobre um valor travado em disputa.
- **RN20:** Somente o administrador pode resolver disputas.
- **RN21:** A opção de manter o valor bloqueado indefinidamente (`KEEP_LOCKED`) foi removida — toda disputa deve resultar em uma das três decisões concretas: liberar ao recebedor, reembolsar ao pagador ou propor renegociação.
- **RN22:** A decisão `RELEASE_TO_RECEIVER` libera o valor ao recebedor e conclui o acordo.
- **RN23:** A decisão `REFUND_TO_PAYER` reembolsa o pagador e cancela o acordo.
- **RN24:** A decisão `PROPOSE_RENEGOTIATION` cria uma nova proposta de prazo (+7 dias) e coloca o acordo em `IN_NEGOTIATION`.
- **RN25:** Disputas `RESOLVED` ou `CLOSED` não podem receber nova decisão.

**Renegociação:**
- **RN26:** O proponente de uma renegociação não pode aceitar ou recusar sua própria proposta.
- **RN27:** Uma renegociação expira automaticamente em 48 horas sem resposta.

**Carteira e saldo:**
- **RN28:** Cada usuário tem exatamente uma carteira, criada no cadastro.
- **RN29:** `availableBalance` representa saldo livre; `blockedBalance` representa saldo comprometido.
- **RN30:** O usuário não pode movimentar diretamente o saldo bloqueado.

**Score:**
- **RN31:** O score inicial de todo usuário é 100 pontos.
- **RN32:** O score não pode ser negativo — é limitado inferiormente a 0.
- **RN33:** O score determina o limite do cartão virtual.
- **RN34:** Score abaixo de 300 impede a ativação do cartão virtual.

**Cartão virtual:**
- **RN35:** Cada usuário pode ter no máximo um cartão virtual SeloPay.
- **RN36:** O cartão virtual não é integrado a bandeiras ou processadoras reais.

**Blockchain e rastreabilidade:**
- **RN37:** Todo evento relevante gera um `BlockchainRecord` com hash SHA256 encadeado.
- **RN38:** O blockchain interno não se conecta a redes públicas ou distribuídas.

**Privacidade:**
- **RN39:** O CPF completo nunca é retornado em nenhuma resposta da API.
- **RN40:** Um acordo só pode ser visualizado pelos seus participantes (pagador ou recebedor), exceto pelo administrador.

---

## 4.6 Casos de Uso

### UC01 — Cadastrar Usuário

- **Ator principal:** Usuário não autenticado
- **Objetivo:** Criar uma conta no sistema SeloPay
- **Pré-condições:** Nenhuma (acesso público)
- **Fluxo principal:**
  1. O usuário informa nome, CPF, e-mail e senha.
  2. O sistema valida que o CPF e o e-mail não estão em uso.
  3. O sistema gera um hash bcrypt da senha.
  4. O sistema gera uma SeloKey única no formato `@{primeironome}XXXXXX`.
  5. O sistema cria o registro de usuário e cria automaticamente uma carteira com saldo zero.
  6. O sistema retorna os dados do usuário e um JWT de autenticação (7 dias).
- **Fluxo alternativo:** Se CPF ou e-mail já estiver em uso, o sistema retorna erro 409 (Conflict).
- **Pós-condições:** Usuário autenticado com carteira criada e SeloKey atribuída.

---

### UC02 — Autenticar Usuário

- **Ator principal:** Usuário cadastrado
- **Objetivo:** Obter um token de acesso ao sistema
- **Pré-condições:** Conta cadastrada
- **Fluxo principal:**
  1. O usuário informa e-mail e senha.
  2. O sistema localiza o usuário pelo e-mail.
  3. O sistema verifica a senha com bcrypt.compare.
  4. O sistema retorna os dados do usuário e um novo JWT.
- **Fluxo alternativo:** Se e-mail não existe ou senha incorreta, retorna erro 401 (Unauthorized) com mensagem genérica.
- **Pós-condições:** Usuário com token JWT válido.

---

### UC03 — Criar Acordo

- **Ator principal:** Usuário autenticado (como pagador)
- **Objetivo:** Formalizar um compromisso com outro usuário
- **Pré-condições:** Usuário autenticado; SeloKey do recebedor deve existir
- **Fluxo principal:**
  1. O pagador informa a SeloKey do recebedor, valor, descrição e data de vencimento.
  2. O sistema verifica que o recebedor existe e é diferente do pagador.
  3. O sistema verifica que a data de vencimento é futura.
  4. O sistema cria o acordo com status `PENDING_ACCEPTANCE` e define `expiresAt` como 1 hora após a criação.
  5. O sistema registra o evento `AGREEMENT_CREATED` no blockchain interno.
- **Fluxo alternativo:** Se o recebedor não for encontrado ou for o próprio pagador, retorna erro 400/404.
- **Pós-condições:** Acordo criado em `PENDING_ACCEPTANCE`, visível para ambas as partes.

---

### UC04 — Aceitar Acordo

- **Ator principal:** Usuário recebedor
- **Objetivo:** Aceitar o compromisso proposto pelo pagador
- **Pré-condições:** Acordo em status `PENDING_ACCEPTANCE`; usuário autenticado é o recebedor
- **Fluxo principal:**
  1. O recebedor acessa o detalhe do acordo.
  2. O recebedor confirma o aceite.
  3. O sistema atualiza o status para `WAITING_DEPOSIT` e o `financialStatus` para `WAITING_SIMULATED_DEPOSIT`.
  4. O sistema cria um `SimulatedPayment` com código Pix e QR Code simulados.
  5. O sistema registra o evento `AGREEMENT_ACCEPTED` no blockchain.
- **Fluxo alternativo:** Se o acordo estiver expirado, retorna erro 400.
- **Pós-condições:** Acordo em `WAITING_DEPOSIT`, aguardando depósito do pagador.

---

### UC05 — Recusar Acordo

- **Ator principal:** Usuário recebedor
- **Objetivo:** Rejeitar o compromisso proposto
- **Pré-condições:** Acordo em `PENDING_ACCEPTANCE`; usuário é o recebedor
- **Fluxo principal:**
  1. O recebedor acessa o detalhe e confirma a recusa.
  2. O sistema atualiza o status para `REJECTED`.
  3. O sistema registra o evento `AGREEMENT_REJECTED` no blockchain.
- **Pós-condições:** Acordo encerrado em `REJECTED`.

---

### UC06 — Realizar Depósito Simulado de Garantia

- **Ator principal:** Usuário pagador
- **Objetivo:** Depositar o valor de garantia para ativar o acordo
- **Pré-condições:** Acordo em `WAITING_DEPOSIT`; usuário é o pagador
- **Fluxo principal (via carteira):**
  1. O pagador escolhe depositar via carteira interna.
  2. O sistema verifica que `availableBalance >= amount`.
  3. Em transação atômica: decrementa `availableBalance`, incrementa `blockedBalance`, registra transação `VALUE_HELD`, atualiza acordo para `ACTIVE` com `financialStatus = VALUE_HELD`.
  4. O sistema registra o evento `GUARANTEE_DEPOSITED_WALLET` no blockchain.
- **Fluxo alternativo (via Pix):** Gera QR Code simulado; confirmação manual via endpoint de demo; incrementa `blockedBalance` sem verificar saldo.
- **Fluxo alternativo (via cartão):** Verifica limite disponível no cartão; incrementa `usedLimit` do cartão; não altera carteira.
- **Pós-condições:** Acordo em `ACTIVE`, valor bloqueado, garantia registrada.

---

### UC07 — Confirmar Cumprimento

- **Ator principal:** Usuário pagador ou recebedor
- **Objetivo:** Registrar o cumprimento de sua parte no acordo
- **Pré-condições:** Acordo em `ACTIVE`, `financialStatus = VALUE_HELD`
- **Fluxo principal:**
  1. O usuário acessa o detalhe do acordo e confirma o cumprimento.
  2. O sistema verifica o papel do usuário (pagador → `OBLIGATION_FULFILLED`; recebedor → `READY_TO_RECEIVE`).
  3. O sistema cria um registro `AgreementConfirmation`.
  4. O sistema verifica se ambas as confirmações já existem.
  5. Se ambas existem: executa a liberação do valor em transação atômica (decrementa `blockedBalance` do pagador, incrementa `availableBalance` do recebedor, registra transações de carteira, atualiza acordo para `COMPLETED` com `financialStatus = VALUE_RELEASED`).
  6. Atualiza score de ambos os participantes (+5 — `AGREEMENT_COMPLETED`).
  7. Registra evento `VALUE_RELEASED` e `AGREEMENT_COMPLETED` no blockchain.
- **Fluxo alternativo:** Se apenas uma confirmação foi registrada, o acordo permanece em `ACTIVE` aguardando a confirmação da outra parte.
- **Pós-condições:** Acordo `COMPLETED`, valor transferido ao recebedor.

---

### UC08 — Contestar Acordo

- **Ator principal:** Usuário pagador ou recebedor
- **Objetivo:** Abrir uma disputa formal sobre o acordo
- **Pré-condições:** Acordo em `ACTIVE` ou `IN_NEGOTIATION`
- **Fluxo principal:**
  1. O usuário informa título e descrição da contestação.
  2. O usuário pode anexar arquivos de evidência (upload).
  3. O sistema cria o registro `Dispute` com status `OPEN`.
  4. O sistema atualiza o acordo para `IN_DISPUTE` e muda `financialStatus` para `VALUE_LOCKED_BY_DISPUTE`.
  5. O sistema registra o evento `DISPUTE_OPENED` no blockchain.
  6. O sistema registra evento de score negativo para o usuário contestado (-5 — `DISPUTE_OPENED_AGAINST_USER`).
- **Pós-condições:** Disputa aberta, valor travado, aguardando análise administrativa.

---

### UC09 — Resolver Disputa (Administrador)

- **Ator principal:** Administrador
- **Objetivo:** Tomar a decisão final em uma disputa e encerrar o impasse
- **Pré-condições:** Disputa em status `OPEN` ou `UNDER_REVIEW`; administrador autenticado
- **Fluxo principal:**
  1. O administrador acessa o detalhe da disputa, lê as evidências e respostas.
  2. O administrador registra uma decisão (`RELEASE_TO_RECEIVER`, `REFUND_TO_PAYER` ou `PROPOSE_RENEGOTIATION`).
  3. Conforme a decisão:
     - `RELEASE_TO_RECEIVER`: libera o valor ao recebedor, encerra o acordo como `COMPLETED`.
     - `REFUND_TO_PAYER`: devolve o valor ao pagador, cancela o acordo como `CANCELLED`.
     - `PROPOSE_RENEGOTIATION`: cria uma proposta de renegociação com +7 dias, coloca o acordo em `IN_NEGOTIATION`.
  4. O sistema registra o impacto no score de ambas as partes (vencedor +5; perdedor -10).
  5. O sistema registra o evento blockchain correspondente.
- **Pós-condições:** Disputa resolvida, acordo encerrado ou em renegociação, scores atualizados.

---

### UC10 — Consultar Carteira

- **Ator principal:** Usuário autenticado
- **Objetivo:** Visualizar saldo e histórico de transações
- **Pré-condições:** Usuário autenticado com carteira criada
- **Fluxo principal:**
  1. O usuário acessa a tela de carteira.
  2. O sistema retorna `availableBalance`, `blockedBalance` e as últimas 100 transações.
- **Pós-condições:** Nenhuma alteração de dados.

---

### UC11 — Consultar Score e Histórico de Reputação

- **Ator principal:** Usuário autenticado
- **Objetivo:** Visualizar o score atual e os eventos que o compõem
- **Pré-condições:** Usuário autenticado
- **Fluxo principal:**
  1. O usuário acessa a tela de score.
  2. O sistema retorna o score atual (campo `user.score`) e os últimos 50 eventos de score.
- **Pós-condições:** Nenhuma alteração de dados.

---

### UC12 — Ativar Cartão Virtual

- **Ator principal:** Usuário autenticado
- **Objetivo:** Ativar o cartão virtual SeloPay
- **Pré-condições:** Usuário autenticado; score >= 300; sem cartão virtual ativo anteriormente
- **Fluxo principal:**
  1. O usuário solicita a ativação do cartão.
  2. O sistema calcula o limite com base no score atual do usuário.
  3. O sistema cria o registro `VirtualCard` com número mascarado, nome do titular, data de expiração e limite.
- **Fluxo alternativo:** Se score < 300, retorna erro explicando que o limite seria zero.
- **Pós-condições:** Cartão virtual `ACTIVE` disponível para uso como garantia.

---

## 4.7 Fluxos Principais

### 4.7.1 Fluxo do Acordo com Garantia (caminho feliz)

O fluxo completo de um acordo com garantia, sem disputas, percorre os seguintes estados e ações:

1. Pagador cria o acordo → status: `PENDING_ACCEPTANCE`
2. Recebedor aceita → status: `WAITING_DEPOSIT`
3. Pagador deposita garantia (carteira/Pix/cartão) → status: `ACTIVE`, financialStatus: `VALUE_HELD`
4. Pagador confirma cumprimento → confirmação registrada (acordo permanece `ACTIVE`)
5. Recebedor confirma recebimento → ambas as confirmações registradas
6. Sistema libera o valor automaticamente → status: `COMPLETED`, financialStatus: `VALUE_RELEASED`
7. Score de ambos incrementado (+5)
8. Evento blockchain registrado

### 4.7.2 Fluxo de Disputa e Resolução

1. Acordo em `ACTIVE` — uma parte contesta
2. Acordo → `IN_DISPUTE`, financialStatus → `VALUE_LOCKED_BY_DISPUTE`
3. Parte contestada responde com evidências
4. Administrador acessa a disputa e registra decisão
5. Conforme decisão: valor é liberado ou reembolsado; ou renegociação proposta
6. Scores atualizados conforme desfecho

### 4.7.3 Fluxo de Renegociação

1. Acordo em `ACTIVE` — uma parte propõe nova data
2. Acordo → `IN_NEGOTIATION`, negociação criada com status `PENDING`
3. Outra parte aceita → data do acordo atualizada, acordo retorna a `ACTIVE`
4. Ou outra parte recusa → negociação `REJECTED`, acordo retorna ao status anterior
5. Ou prazo de 48h expira → negociação `EXPIRED`

### 4.7.4 Fluxo de Reputação

1. A cada evento relevante (conclusão, disputa, renegociação), o `ScoreService.recordEvent()` é chamado.
2. O delta é somado ao campo `user.score`, respeitando o mínimo de 0.
3. Um `ScoreEvent` é persistido com tipo, delta e descrição.
4. O limite do cartão virtual pode ser recalculado a qualquer momento com base no score atual.
