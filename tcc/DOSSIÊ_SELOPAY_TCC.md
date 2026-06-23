# DOSSIÊ COMPLETO DO PROJETO SELOPAY PARA TCC

> **Documento gerado com base na análise direta do código-fonte, schema Prisma, controllers, services, telas mobile e arquivos de configuração do repositório.**
> Última atualização: Junho de 2026.
> Nenhum arquivo do projeto foi alterado na geração deste documento.

---

## 1. Identificação do Projeto

| Campo | Valor |
|---|---|
| **Nome do projeto** | SeloPay |
| **Nome do produto** | SeloPay — Plataforma de Acordos Digitais |
| **Tipo de sistema** | Aplicação web/mobile de acordos digitais com simulação financeira |
| **Área de aplicação** | Finanças pessoais, confiança digital, formalização de compromissos |
| **Contexto acadêmico** | Trabalho de Conclusão de Curso — Ciência da Computação |
| **Repositório** | Monorepo pnpm — `apps/api` (NestJS) + `apps/mobile` (Expo/React Native) |
| **Banco de dados** | PostgreSQL 16, porta 5435, via Docker |
| **ORM** | Prisma 5.9.1 |
| **Autenticação** | JWT (usuário comum + admin, JWT secrets separados) |
| **Status geral** | MVP funcional — API completa, mobile em andamento avançado |

### Resumo Executivo

O SeloPay é uma plataforma digital que permite a criação, acompanhamento e resolução de acordos financeiros e não financeiros entre pessoas. O sistema transforma combinados informais em compromissos digitalmente registrados, com suporte a garantia simulada de valores, sistema de reputação baseado em score, carteira virtual, depósito via Pix simulado, cartão de crédito baseado em confiança e registro imutável de eventos via blockchain interno (simulado).

O projeto é desenvolvido como MVP acadêmico para TCC de Ciência da Computação, utilizando arquitetura moderna de microsserviços com monorepo, sem qualquer movimentação financeira real.

---

## 2. Problema que o SeloPay Resolve

Acordos informais entre pessoas — empréstimos, prestações de serviço, parcelamentos, combinados de pagamento, freelances, aluguéis entre conhecidos — são extremamente comuns na vida cotidiana, mas raramente documentados de forma estruturada. Isso gera uma série de problemas reais:

- **Falta de registro claro**: O acordo existe apenas na memória ou em conversas informais (WhatsApp, verbal), sem data, valor ou responsabilidades formalizadas.
- **Ausência de prova organizada**: Em caso de conflito, não há evidência confiável de que o acordo existia ou de quais eram seus termos.
- **Dificuldade de cobrança**: Sem registro, cobrar se torna constrangedor e ineficiente.
- **Conflitos sobre prazos, valores e responsabilidades**: Interpretações divergentes sobre o que foi combinado.
- **Falta de confiança entre pagador e recebedor**: Especialmente em primeiros negócios ou entre pessoas com pouco relacionamento.
- **Dificuldade de acompanhar acordos pequenos ou pessoais**: Não existe uma ferramenta simples para monitorar múltiplos compromissos simultâneos.
- **Risco em pagamentos antecipados**: Pagar antes de receber o serviço ou produto é arriscado sem garantia.
- **Risco em promessas de pagamento sem garantia**: Prestar serviço antes de receber pagamento também é arriscado.
- **Ausência de reputação digital**: Não existe um histórico verificável de cumprimento de acordos em contextos informais.

O SeloPay propõe resolver esses problemas por meio de uma infraestrutura digital leve, acessível por dispositivo móvel, que registra, acompanha e oferece mecanismos de proteção e resolução para acordos entre pessoas.

---

## 3. Objetivo Geral do Sistema

O SeloPay tem como objetivo geral oferecer uma infraestrutura digital para **criação, aceite, acompanhamento, confirmação, contestação e registro de acordos entre usuários**, com suporte opcional a garantia simulada de valores, sistema de reputação e painel administrativo para resolução de disputas.

O sistema visa transformar o compromisso informal em um registro confiável, rastreável e auditável, sem exigir burocracia jurídica, mas fornecendo as evidências digitais necessárias para que ambas as partes se sintam protegidas.

---

## 4. Objetivos Específicos

| # | Objetivo | Status no MVP |
|---|---|---|
| OE01 | Permitir cadastro de usuários com geração automática de chave única (SeloKey) | Implementado |
| OE02 | Permitir autenticação segura com JWT e senhas hasheadas | Implementado |
| OE03 | Permitir criação de acordos digitais entre dois usuários | Implementado |
| OE04 | Registrar partes envolvidas, valor, prazo e descrição do acordo | Implementado |
| OE05 | Permitir aceite ou recusa do acordo pela parte recebedora | Implementado |
| OE06 | Acompanhar o status do acordo ao longo do ciclo de vida | Implementado |
| OE07 | Simular depósito de garantia via carteira, Pix ou cartão | Implementado |
| OE08 | Bloquear o valor simulado enquanto o acordo está ativo | Implementado |
| OE09 | Liberar o valor apenas após confirmação das duas partes | Implementado |
| OE10 | Permitir abertura de disputas com anexo de evidências | Implementado |
| OE11 | Prover painel administrativo para resolução manual de disputas | Implementado |
| OE12 | Registrar histórico de eventos do acordo em blockchain interno (simulado) | Implementado |
| OE13 | Calcular e atualizar score de reputação do usuário baseado em comportamento | Implementado |
| OE14 | Disponibilizar cartão virtual com limite baseado no score | Implementado |
| OE15 | Permitir renegociação de acordos com nova data de vencimento | Implementado |
| OE16 | Disponibilizar carteira digital com saldo disponível e bloqueado | Implementado |
| OE17 | Suportar depósito simulado via Pix com QR Code e copia-e-cola fake | Implementado |
| OE18 | Gerar notificações internas de eventos do sistema | Parcialmente implementado |

---

## 5. Público-Alvo

O SeloPay é projetado para atender pessoas físicas que realizam acordos informais no cotidiano. Os perfis de usuário identificados são:

- **Pessoas físicas em geral**: que combinam valores com amigos, familiares ou conhecidos.
- **Freelancers e prestadores de serviço autônomos**: que precisam registrar combinados com clientes sem contratos formais.
- **Clientes de serviços informais**: que querem garantia de que o serviço será entregue antes de liberar o pagamento completo.
- **Pequenos negócios informais**: que não têm infraestrutura jurídica, mas querem algum nível de formalização.
- **Pessoas em relacionamentos de confiança parcial**: conhecidos, colegas, vizinhos, que precisam de um registro digital para minimizar conflitos futuros.
- **Usuários que buscam construir reputação digital de confiança**: interessados em acumular histórico positivo de cumprimento de acordos.

O sistema não exige conhecimento técnico avançado. A interface mobile é desenhada para ser intuitiva e acessível ao público geral.

---

## 6. Justificativa

O projeto SeloPay é relevante para um TCC de Ciência da Computação pelas seguintes razões:

**Tecnológicas:**
- Implementa uma arquitetura moderna de monorepo com separação clara entre frontend mobile e backend REST.
- Usa tecnologias amplamente adotadas na indústria: NestJS, Prisma, PostgreSQL, Expo/React Native.
- Demonstra o uso de máquina de estados para modelagem de fluxos complexos (ciclo de vida do acordo).
- Implementa autenticação JWT com contextos separados (usuário e administrador).
- Demonstra padrões de segurança como hash de senhas com bcrypt, mascaramento de CPF, rate-limiting e CORS.

**Acadêmicas:**
- Resolve um problema real e mensurável da vida cotidiana.
- Abrange múltiplas disciplinas: engenharia de software, banco de dados, segurança, UX, arquitetura de sistemas.
- Permite discussão sobre temas como confiança digital, reputação, rastreabilidade e auditabilidade.
- Serve como base para explorar futuros temas de pesquisa: fintech, legaltech, trusttech, blockchain, KYC.

**Práticas:**
- O sistema pode ser demonstrado em ambiente de desenvolvimento de forma completa e funcional.
- Fluxos de ponta a ponta são testáveis: criação, aceite, depósito, confirmação, contestação, resolução.
- Possui valor de produto real: a problemática é genuína e o público-alvo é amplo.

---

## 7. Visão Geral da Solução

O SeloPay funciona como um intermediário digital de confiança entre duas pessoas. Em alto nível:

1. **Criação**: Um usuário (pagador) cria um acordo, informando a parte recebedora pela SeloKey, o valor, a data e a descrição.
2. **Aceite**: A parte recebedora aceita ou recusa o acordo. O pagador não pode criar um acordo consigo mesmo.
3. **Depósito (acordos com garantia)**: Após o aceite, o pagador deposita o valor simulado via carteira interna, Pix simulado ou cartão virtual SeloPay. O valor fica bloqueado.
4. **Acompanhamento**: Ambas as partes acompanham o status do acordo pelo app.
5. **Confirmação dupla**: Para liberar o valor, o pagador confirma que cumpriu a obrigação e o recebedor confirma que está pronto para receber. Ambas as confirmações são necessárias.
6. **Contestação**: Se houver problema, qualquer das partes pode abrir uma disputa, travar o valor e enviar evidências.
7. **Resolução**: O administrador analisa as evidências e toma a decisão: liberar para o recebedor, reembolsar o pagador ou propor renegociação.
8. **Renegociação**: As partes podem propor e aceitar uma nova data de vencimento sem encerrar o acordo.
9. **Histórico e Reputação**: Cada evento gera registro no histórico do usuário e atualiza o score de confiança.
10. **Blockchain interno**: Cada evento relevante é registrado em uma cadeia de hashes SHA256, garantindo rastreabilidade e auditabilidade (simulado, não em blockchain público).

---

## 8. Principais Funcionalidades

### 8.1 Cadastro e Autenticação
- Cadastro com nome, CPF (mascarado automaticamente), e-mail e senha.
- Geração automática de SeloKey única no formato `@{firstname}XXXXXX` (6 hexadecimais).
- Login com JWT (token de 7 dias para usuário, 1 dia para admin).
- Senhas armazenadas com bcrypt (salt 10). CPF nunca exposto completo.
- Carteira digital criada automaticamente no cadastro (saldo zero).

### 8.2 Perfil e SeloKey
- Cada usuário possui uma chave pública única chamada SeloKey.
- A SeloKey é usada para identificar o recebedor ao criar um acordo.
- Exibida no perfil e copiável com toque.
- Imutável após criação.

### 8.3 Acordo Simples
- Registro digital de compromisso entre duas partes.
- Não bloqueia dinheiro. Não movimenta saldo.
- Permite aceite, recusa, confirmação e contestação.
- Afeta histórico e reputação.
- **Nota**: no schema atual, o tipo único implementado é `GUARANTEED`. Acordo sem movimentação financeira é tratado como variação de fluxo onde o depósito não é realizado ou o valor é zero.

### 8.4 Acordo com Garantia (GUARANTEED)
- O pagador deposita um valor simulado que fica bloqueado.
- O valor só é liberado após confirmação dupla ou decisão administrativa.
- Suporta três fontes de garantia: carteira interna, Pix simulado e cartão virtual SeloPay.

### 8.5 Carteira Digital
- Saldo disponível (`availableBalance`) e saldo bloqueado (`blockedBalance`).
- Histórico de até 100 movimentações.
- Depósito simulado via Pix (QR Code e copia-e-cola fake).
- Rota de crédito demo (`/wallet/simulate-credit`) para testes.

### 8.6 Depósito via Pix Simulado
- O pagador gera um "Pix" com QR Code e copia-e-cola falsos.
- A confirmação é manual no ambiente de demo (endpoint `/deposits/:id/simulate-confirm`).
- Não há integração com o Banco Central ou qualquer PSP real.

### 8.7 Cartão Virtual SeloPay
- Cartão de crédito interno baseado em score de confiança.
- Limite calculado dinamicamente conforme a faixa de score do usuário.
- Pode ser usado como garantia em acordos (bloqueia limite em vez de saldo).
- Suporta ativação, recálculo de limite e histórico de transações.

### 8.8 Disputas
- Qualquer participante pode abrir uma contestação enquanto o acordo está ativo.
- Suporte ao envio de evidências (upload de arquivos, armazenamento simulado).
- A parte contestada pode responder com mensagem e evidências.
- O valor fica travado (`VALUE_LOCKED_BY_DISPUTE`) até decisão administrativa.

### 8.9 Painel Administrativo
- Login separado com JWT específico para admin.
- Dashboard com métricas: total de usuários, acordos, disputas abertas.
- Listagem de usuários, acordos e disputas.
- Registro de decisão em disputas: liberar para recebedor, reembolsar pagador, propor renegociação ou solicitar mais evidências.

### 8.10 Score de Confiança
- Score inicial: 100 pontos (novo usuário).
- Eventos positivos e negativos registrados a cada ação relevante.
- Score exibido no perfil e na tela dedicada com gauge visual.
- Influencia o limite do cartão virtual.

### 8.11 Renegociação
- O administrador ou as partes podem propor uma nova data de vencimento.
- O acordo entra em estado `IN_NEGOTIATION` até que a outra parte aceite ou recuse.
- Ao aceitar, o acordo retorna ao estado ativo com nova data.
- Ao recusar, o acordo retorna ao estado anterior.
- O proponente não vê botões de ação durante a renegociação — apenas mensagem de espera.

### 8.12 Blockchain Interno (Simulado)
- Cada evento relevante é registrado em uma tabela `blockchain_records`.
- Cada registro contém: tipo de evento, payload JSON, hash anterior, hash atual (SHA256) e hash de transação (`SELO` + 16 caracteres hex).
- Forma uma cadeia verificável internamente.
- Não integra blockchain público (Bitcoin, Ethereum, Hyperledger etc.).
- Tela dedicada no mobile para verificação da cadeia de provas do acordo.

### 8.13 Notificações
- Entidade de notificação presente no schema.
- Contexto de notificações implementado no mobile (unreadCount, notifications[]).
- Implementação parcial — notificações são consultadas mas não são enviadas por push real (FCM/APNs).

---

## 9. Fluxo Geral do Usuário

### Em linguagem simples:

O usuário baixa o app, cria uma conta e recebe uma chave única chamada SeloKey. Para fazer um acordo, ele informa a SeloKey da outra parte, descreve o que foi combinado, informa o valor e a data de vencimento. A outra parte recebe o acordo no app e pode aceitar ou recusar.

Se o acordo for com garantia, o pagador deposita o valor (simulado) e o dinheiro fica "travado" até que tudo seja cumprido. Quando o serviço for entregue, o pagador confirma e o recebedor também confirma — só com as duas confirmações o valor é liberado.

Se algo der errado, qualquer uma das partes pode abrir uma contestação, enviar provas e o sistema fica em espera até que um administrador analise e tome a decisão.

### Em etapas:

| Etapa | Ação | Status resultante |
|---|---|---|
| 1 | Usuário cria conta | Conta criada, SeloKey gerada, Carteira criada |
| 2 | Usuário faz login | JWT emitido, acesso liberado |
| 3 | Pagador cria acordo informando SeloKey do recebedor | `PENDING_ACCEPTANCE` |
| 4 | Recebedor vê o acordo no app | — |
| 5a | Recebedor recusa | `REJECTED` |
| 5b | Recebedor aceita (acordo com garantia) | `WAITING_DEPOSIT` |
| 6 | Pagador realiza depósito simulado (wallet/Pix/cartão) | `ACTIVE` + `VALUE_HELD` |
| 7 | Ambas as partes acompanham o acordo | `ACTIVE` |
| 8 | Pagador confirma que cumpriu | Confirmação parcial |
| 9 | Recebedor confirma que está pronto para receber | Ambas as confirmações = libera valor |
| 10 | Valor liberado para recebedor | `COMPLETED` + `VALUE_RELEASED` |
| 10b | Alguma parte contesta antes de concluir | `IN_DISPUTE` + `VALUE_LOCKED_BY_DISPUTE` |
| 11 | Admin analisa evidências e decide | Depende da decisão |
| 12 | Histórico e score são atualizados | — |

---

## 10. Tipos de Acordo

### 10.1 Acordo Simples

O acordo simples é um compromisso registrado entre duas partes sem envolvimento de valor financeiro bloqueado no sistema.

**Características:**
- Não guarda, não bloqueia e não movimenta dinheiro.
- Funciona como um registro formal digital do compromisso.
- Permite aceite ou recusa pela parte recebedora.
- Permite confirmação de cumprimento por ambas as partes.
- Permite abertura de contestação, mas sem valor financeiro em disputa.
- Afeta o histórico e o score de reputação do usuário.
- Adequado para compromissos de serviço, entregas, prazos combinados ou qualquer acordo sem componente financeiro.

**Importante**: No schema atual do SeloPay, o tipo de acordo único implementado é `GUARANTEED`. A distinção entre "simples" e "com garantia" é tratada no fluxo: acordos onde o depósito não é realizado ou o valor é zero comportam-se como acordos simples em termos de registro e acompanhamento.

### 10.2 Acordo com Garantia (GUARANTEED)

O acordo com garantia envolve a proteção simulada de um valor financeiro durante a execução do compromisso.

**Características:**
- O pagador deve depositar o valor acordado após o aceite da outra parte.
- O valor fica bloqueado no sistema (`blockedBalance`) e não pode ser usado por nenhuma das partes.
- Somente é liberado quando ambas as partes confirmarem o cumprimento.
- Se houver contestação, o valor permanece travado até decisão administrativa.
- Suporta três formas de depósito simulado: carteira interna, Pix simulado e cartão virtual SeloPay.
- A liberação credita o valor na carteira do recebedor (`availableBalance`).
- O reembolso, em caso de decisão favorável ao pagador, devolve o valor ao pagador.

**Fontes de garantia disponíveis:**

| Fonte | Endpoint | Comportamento |
|---|---|---|
| Carteira interna | `POST /agreements/:id/simulate-deposit` | Decrementa `availableBalance`, incrementa `blockedBalance` do pagador |
| Pix simulado | `POST /agreements/:id/simulate-deposit-pix` | Incrementa `blockedBalance` sem checar saldo (simulado) |
| Cartão SeloPay | `POST /agreements/:id/simulate-deposit-card` | Bloqueia limite do cartão virtual (sem afetar wallet) |

---

## 11. Regras de Negócio

### 11.1 Acordo

- **RN-AG01**: Apenas usuários autenticados podem criar acordos.
- **RN-AG02**: O pagador (criador) não pode ser o mesmo que o recebedor.
- **RN-AG03**: O recebedor deve ser localizado via SeloKey válida e existente.
- **RN-AG04**: A data de vencimento (`dueDate`) deve ser futura em relação à criação.
- **RN-AG05**: O acordo expira automaticamente (`EXPIRED`) se permanecer em `PENDING_ACCEPTANCE` após 1 hora.
- **RN-AG06**: Somente o recebedor pode aceitar ou recusar um acordo em `PENDING_ACCEPTANCE`.
- **RN-AG07**: Após aceite, o acordo com garantia vai para `WAITING_DEPOSIT`.
- **RN-AG08**: O depósito de garantia só pode ser realizado pelo pagador.
- **RN-AG09**: O depósito via carteira exige `availableBalance >= amount`.
- **RN-AG10**: O depósito via Pix simulado não verifica saldo (simulação).
- **RN-AG11**: O depósito via cartão exige que o cartão esteja ativo e com limite disponível suficiente.
- **RN-AG12**: Após depósito confirmado, o acordo passa para `ACTIVE` com `financialStatus = VALUE_HELD`.
- **RN-AG13**: Um acordo `ACTIVE` pode ser confirmado, contestado ou renegociado.
- **RN-AG14**: A confirmação do pagador registra `OBLIGATION_FULFILLED`; a do recebedor registra `READY_TO_RECEIVE`.
- **RN-AG15**: O valor só é liberado quando AMBAS as confirmações estiverem registradas.
- **RN-AG16**: Após dupla confirmação, `blockedBalance` do pagador é decrementado e `availableBalance` do recebedor é incrementado.
- **RN-AG17**: Após liberação, o acordo vai para `COMPLETED` com `financialStatus = VALUE_RELEASED`.

### 11.2 Disputa

- **RN-DP01**: A disputa só pode ser aberta quando o acordo está em `ACTIVE` ou `IN_NEGOTIATION`.
- **RN-DP02**: Qualquer um dos participantes (pagador ou recebedor) pode abrir a disputa.
- **RN-DP03**: Ao abrir a disputa em acordo com garantia, o `financialStatus` muda para `VALUE_LOCKED_BY_DISPUTE`.
- **RN-DP04**: O valor travado não pode ser movido por nenhuma das partes enquanto a disputa estiver aberta.
- **RN-DP05**: Evidências podem ser enviadas (arquivos) por qualquer das partes.
- **RN-DP06**: A parte contestada pode responder com mensagem e evidências.
- **RN-DP07**: Apenas o administrador pode tomar a decisão final em uma disputa.
- **RN-DP08**: A decisão `RELEASE_TO_RECEIVER` libera o valor bloqueado para o recebedor e encerra o acordo como `COMPLETED`.
- **RN-DP09**: A decisão `REFUND_TO_PAYER` devolve o valor ao pagador e cancela o acordo como `CANCELLED`.
- **RN-DP10**: A decisão `PROPOSE_RENEGOTIATION` cria uma negociação e coloca o acordo em `IN_NEGOTIATION`.
- **RN-DP11**: A decisão `REQUEST_MORE_EVIDENCE` mantém a disputa em `UNDER_REVIEW` sem alterar o valor.
- **RN-DP12**: Disputas resolvidas (`RESOLVED`) ou encerradas (`CLOSED`) não podem receber nova decisão.

### 11.3 Renegociação

- **RN-NE01**: A renegociação só pode ser proposta quando o acordo está em `ACTIVE` ou `IN_DISPUTE`.
- **RN-NE02**: Qualquer uma das partes pode propor uma renegociação informando uma nova data.
- **RN-NE03**: O proponente tem seu lado marcado automaticamente como aceito (`payerAccepted` ou `receiverAccepted = true`).
- **RN-NE04**: A outra parte deve explicitamente aceitar ou recusar a proposta.
- **RN-NE05**: O proponente não pode aceitar ou recusar sua própria proposta.
- **RN-NE06**: Se aceita, a data do acordo é atualizada e o status retorna para `ACTIVE`.
- **RN-NE07**: Se recusada, o acordo retorna ao status anterior.
- **RN-NE08**: A negociação expira em 48 horas se não houver resposta.

### 11.4 Carteira

- **RN-WL01**: Cada usuário tem exatamente uma carteira (criada no cadastro).
- **RN-WL02**: `availableBalance` representa o saldo livre para uso.
- **RN-WL03**: `blockedBalance` representa o valor comprometido com acordos ativos.
- **RN-WL04**: O usuário não pode movimentar o saldo bloqueado diretamente.
- **RN-WL05**: Um depósito em disputa bloqueia o valor até resolução administrativa.
- **RN-WL06**: O depósito via `simulate-deposit` exige `availableBalance >= amount`.

### 11.5 SeloKey

- **RN-SK01**: A SeloKey é gerada automaticamente no cadastro do usuário.
- **RN-SK02**: Formato: `@{primeironome}` + 6 caracteres hexadecimais maiúsculos.
- **RN-SK03**: Único no sistema — até 5 tentativas de geração em caso de colisão.
- **RN-SK04**: A SeloKey é imutável após a criação.
- **RN-SK05**: Usada para identificar o recebedor na criação de acordos.

### 11.6 Score

- **RN-SC01**: Todo novo usuário começa com score 100.
- **RN-SC02**: O score é atualizado a cada evento de comportamento relevante.
- **RN-SC03**: O score nunca pode ser negativo (limitado inferiormente a 0).
- **RN-SC04**: O score influencia o limite do cartão virtual SeloPay.
- **RN-SC05**: O histórico de eventos de score é mantido indefinidamente.

### 11.7 Cartão Virtual

- **RN-CV01**: Cada usuário pode ter no máximo um cartão virtual SeloPay.
- **RN-CV02**: O cartão é ativado com limite calculado com base no score atual.
- **RN-CV03**: O limite é recalculável a qualquer momento via endpoint específico.
- **RN-CV04**: O cartão pode ser usado como fonte de garantia em acordos GUARANTEED.
- **RN-CV05**: Ao usar o cartão como garantia, o `usedLimit` é incrementado (não afeta wallet).
- **RN-CV06**: Ao resolver a disputa ou refundar, o limite é devolvido ao cartão.

### 11.8 Blockchain (Simulado)

- **RN-BC01**: Eventos relevantes do sistema geram um `BlockchainRecord`.
- **RN-BC02**: Cada registro contém o hash SHA256 do registro anterior (`previousHash`) e seu próprio hash.
- **RN-BC03**: O `txHash` é gerado como `SELO` + 16 caracteres hexadecimais aleatórios.
- **RN-BC04**: Não há integração com blockchain público.
- **RN-BC05**: O registro é imutável no banco de dados por convenção — não há operação de update ou delete em `blockchain_records`.

---

## 12. Estados e Status do Sistema

### 12.1 Status do Acordo (`AgreementStatus`)

| Status (técnico) | Status (traduzido) | Descrição |
|---|---|---|
| `PENDING_ACCEPTANCE` | Aguardando aceite | Acordo criado, esperando resposta do recebedor. Expira em 1 hora. |
| `WAITING_DEPOSIT` | Aguardando depósito | Recebedor aceitou. Pagador deve depositar a garantia. |
| `ACTIVE` | Ativo | Depósito confirmado. Acordo em execução. |
| `IN_NEGOTIATION` | Em renegociação | Uma das partes propôs nova data de vencimento. |
| `IN_DISPUTE` | Em disputa / Contestado | Contestação aberta. Valor travado. |
| `COMPLETED` | Concluído | Ambas as confirmações realizadas. Valor liberado. |
| `CANCELLED` | Cancelado | Encerrado sem conclusão (ex: reembolso ao pagador). |
| `REJECTED` | Recusado | Recebedor recusou o acordo. |
| `EXPIRED` | Expirado | Ninguém respondeu dentro de 1 hora. |

> **Nota**: O enum `AgreementType` no schema atual contém apenas `GUARANTEED`. A distinção "simples vs com garantia" é tratada no fluxo de negócio e não no tipo do enum.

### 12.2 Status Financeiro (`FinancialStatus`)

| Status (técnico) | Status (traduzido) | Descrição |
|---|---|---|
| `NO_FINANCIAL_MOVEMENT` | Sem movimentação | Acordo sem componente financeiro ou aguardando. |
| `WAITING_SIMULATED_DEPOSIT` | Aguardando depósito simulado | Aceite realizado, aguardando depósito do pagador. |
| `SIMULATED_PAYMENT_PROCESSING` | Processando pagamento simulado | Pix sendo "processado". |
| `SIMULATED_PAYMENT_CONFIRMED` | Pagamento simulado confirmado | Pix confirmado pelo demo. |
| `VALUE_HELD` | Valor retido | Depósito realizado e valor bloqueado. |
| `VALUE_LOCKED_BY_DISPUTE` | Valor travado por disputa | Disputa aberta, valor imóvel. |
| `VALUE_RELEASED` | Valor liberado | Dupla confirmação concluída. Valor enviado ao recebedor. |
| `REFUND_PENDING` | Reembolso pendente | Aguardando processamento de reembolso. |
| `VALUE_REFUNDED` | Valor reembolsado | Valor devolvido ao pagador. |

### 12.3 Status de Disputa (`DisputeStatus`)

| Status | Tradução | Descrição |
|---|---|---|
| `OPEN` | Em disputa | Recém-aberta, aguardando análise. |
| `UNDER_REVIEW` | Em análise | Admin está analisando. |
| `RESOLVED` | Resolvida | Decisão tomada e aplicada. |
| `CLOSED` | Encerrada | Arquivada sem ação (raro). |

### 12.4 Status de Negociação (`NegotiationStatus`)

| Status | Tradução | Descrição |
|---|---|---|
| `PENDING` | Pendente | Aguardando resposta da outra parte. |
| `ACCEPTED` | Aceita | Ambos aceitaram a nova data. |
| `REJECTED` | Recusada | A outra parte recusou a proposta. |
| `EXPIRED` | Expirada | 48 horas sem resposta. |

### 12.5 Status do Cartão Virtual (`VirtualCardStatus`)

| Status | Tradução | Descrição |
|---|---|---|
| `INACTIVE` | Inativo | Cartão não ativado. |
| `ACTIVE` | Ativo | Cartão em uso. |
| `BLOCKED` | Bloqueado | Cartão suspenso. |

### 12.6 Status do Depósito Pix (`PixDepositStatus`)

| Status | Tradução | Descrição |
|---|---|---|
| `PENDING` | Pendente | Aguardando confirmação. Expira em 30 minutos. |
| `CONFIRMED` | Confirmado | Depósito confirmado (manualmente no demo). |
| `EXPIRED` | Expirado | Não confirmado a tempo. |
| `FAILED` | Falhou | Erro no processamento. |

### 12.7 Tipo de Transação de Carteira (`WalletTransactionType`)

| Tipo (técnico) | Tradução |
|---|---|
| `SIMULATED_DEPOSIT` | Depósito simulado |
| `VALUE_HELD` | Valor bloqueado (garantia) |
| `VALUE_RELEASED` | Valor liberado para recebedor |
| `VALUE_RECEIVED` | Valor recebido (crédito na carteira) |
| `SIMULATED_REFUND` | Reembolso simulado |
| `VALUE_LOCKED_BY_DISPUTE` | Valor travado por disputa |
| `DISPUTE_RESOLVED_RELEASE` | Valor liberado por decisão admin |
| `DISPUTE_RESOLVED_REFUND` | Reembolso por decisão admin |

---

## 13. Carteira Digital

A carteira digital do SeloPay (`Wallet`) é criada automaticamente quando o usuário se cadastra e representa o saldo interno do usuário dentro do sistema simulado.

### Estrutura

| Campo | Tipo | Descrição |
|---|---|---|
| `availableBalance` | Decimal | Saldo livre, disponível para uso e depósitos de garantia |
| `blockedBalance` | Decimal | Saldo comprometido com acordos ativos, não utilizável diretamente |

### Operações disponíveis

| Operação | Endpoint | Descrição |
|---|---|---|
| Consultar saldo | `GET /wallet` | Retorna saldo disponível, bloqueado e dados do usuário |
| Histórico | `GET /wallet/transactions` | Últimas 100 transações com detalhes do acordo vinculado |
| Gerar Pix de depósito | `POST /wallet/deposits/pix` | Cria QR Code e copia-e-cola fake (expira em 30 min) |
| Confirmar Pix (demo) | `POST /wallet/deposits/:id/simulate-confirm` | Confirma o depósito manualmente |
| Crédito demo | `POST /wallet/simulate-credit` | Adiciona saldo diretamente (apenas para testes) |

### Relação com acordos

Quando o pagador deposita a garantia de um acordo com garantia via carteira:
- `availableBalance` é decrementado no valor do acordo.
- `blockedBalance` é incrementado no mesmo valor.
- Uma transação do tipo `VALUE_HELD` é registrada.

Ao concluir o acordo:
- `blockedBalance` do pagador é decrementado.
- `availableBalance` do recebedor é incrementado.
- Transações `VALUE_RELEASED` (pagador) e `VALUE_RECEIVED` (recebedor) são registradas.

### Limitações do MVP

- Não há saque real de saldo.
- O saldo só pode ser adicionado via `simulate-credit` (rota de demo) ou via confirmação de Pix simulado.
- Não há integração com sistema bancário real.

---

## 14. Depósito via Pix Simulado

O SeloPay implementa dois tipos de Pix simulado:

### 14.1 Pix para depósito na carteira

- Rota: `POST /wallet/deposits/pix`
- Gera um `PixDeposit` com `qrCodePayload` (URL fake) e `copyPasteCode` (código copia-e-cola fake).
- Expira em 30 minutos.
- Confirmação manual via `POST /wallet/deposits/:id/simulate-confirm`.
- Ao confirmar, incrementa `availableBalance` da carteira do usuário.
- **Não há integração real com Banco Central, PSP, Open Finance ou qualquer provedor Pix.**

### 14.2 Pix para garantia de acordo

- Rota: `POST /agreements/:id/simulate-deposit-pix`
- Gera um `SimulatedPayment` com `fakePixCode` e `fakeQrCode` (URL fake).
- Ao "confirmar", incrementa `blockedBalance` do pagador diretamente, sem verificar saldo disponível.
- Tela dedicada no mobile (`deposit-pix.tsx`) exibe o QR Code fake.
- **100% simulado. Não há processamento real de pagamento.**

### Por que simular o Pix?

Para o MVP acadêmico, o Pix real exigiria:
- Conta em PSP regulado pelo Banco Central.
- Chaves Pix registradas.
- Webhook de confirmação.
- Compliance com regras do SPI (Sistema de Pagamentos Instantâneos).

A simulação permite demonstrar o fluxo completo sem esses requisitos, mantendo a fidelidade arquitetural para futura integração.

---

## 15. Liberação com Confirmação das Duas Partes

Esta é a regra central do mecanismo de garantia do SeloPay.

### Como funciona

Em um acordo com garantia ativo (`ACTIVE`, `financialStatus = VALUE_HELD`):

1. **O pagador confirma**: `POST /agreements/:id/confirm` com `confirmationType = OBLIGATION_FULFILLED`. Significa: "Cumpri minha parte".
2. **O recebedor confirma**: `POST /agreements/:id/confirm` com `confirmationType = READY_TO_RECEIVE`. Significa: "Reconheço o cumprimento e estou pronto para receber".

Somente quando **ambas as confirmações** estiverem registradas:
- O sistema processa a liberação do valor em uma transação atômica.
- `blockedBalance` do pagador é decrementado.
- `availableBalance` do recebedor é incrementado.
- O acordo passa para `COMPLETED`.
- `financialStatus` passa para `VALUE_RELEASED`.
- Score de ambos é atualizado.
- Evento blockchain é registrado.

### Por que essa regra é importante

- **Protege o pagador**: O dinheiro não é liberado apenas pelo recebedor declarar que recebeu.
- **Protege o recebedor**: O dinheiro fica garantido e não pode ser recuperado pelo pagador unilateralmente.
- **Força consenso**: Ambas as partes precisam concordar que o acordo foi cumprido.
- **Diferencial de produto**: É o mecanismo que diferencia o SeloPay de um simples registro — há consequência financeira (simulada) para o não-cumprimento.

### Comportamento em disputa

Se qualquer uma das partes abrir uma contestação antes da dupla confirmação:
- O acordo vai para `IN_DISPUTE`.
- `financialStatus` muda para `VALUE_LOCKED_BY_DISPUTE`.
- Nenhuma das partes consegue confirmar ou mover o valor.
- Somente o administrador pode resolver.

---

## 16. Disputas e Resolução Manual

### Abertura de disputa

- **Quando**: Acordo em status `ACTIVE` ou `IN_NEGOTIATION`.
- **Quem**: Qualquer dos participantes (pagador ou recebedor).
- **O que é enviado**: Título, descrição e evidências (upload de arquivos).
- **Efeito imediato**: Acordo vai para `IN_DISPUTE`. Se GUARANTEED, `financialStatus = VALUE_LOCKED_BY_DISPUTE`.

### Resposta da parte contestada

- A parte que não abriu a disputa pode responder com mensagem e evidências adicionais.
- Rota: `POST /disputes/:id/respond`.

### Envio de evidências

- Suporte a upload de arquivos (multipart/form-data).
- Armazenados em `/uploads` (armazenamento local simulado, não em serviço de cloud real).
- URL gerada como `fake-storage.selopay.com/...` no schema (demonstra a intenção arquitetural).

### Decisões administrativas disponíveis

| Decisão (`AdminDecisionType`) | Tradução | Efeito |
|---|---|---|
| `RELEASE_TO_RECEIVER` | Favor ao recebedor | Libera valor bloqueado para recebedor → COMPLETED |
| `REFUND_TO_PAYER` | Favor ao pagador | Reembolsa valor ao pagador → CANCELLED |
| `PROPOSE_RENEGOTIATION` | Propor renegociação | Cria Negotiation com +7 dias → IN_NEGOTIATION |
| `REQUEST_MORE_EVIDENCE` | Mais informações | Mantém disputa em UNDER_REVIEW |

**Nota**: A opção `KEEP_LOCKED` (manter valor travado indefinidamente) foi removida do MVP por não gerar resolução concreta.

### Impacto no score

| Decisão | Efeito no score do vencedor | Efeito no score do perdedor |
|---|---|---|
| `RELEASE_TO_RECEIVER` | +5 (receiver) | -10 (payer) |
| `REFUND_TO_PAYER` | +5 (payer) | -10 (receiver) |

---

## 17. Histórico e Reputação

O sistema mantém múltiplas camadas de histórico:

### Histórico de acordos

- Cada usuário tem todos os acordos onde participou como pagador ou recebedor.
- Filtráveis por status na listagem.
- Acessível pelo app mobile.

### Histórico de transações da carteira

- Cada movimentação de saldo gera um `WalletTransaction`.
- Últimas 100 transações acessíveis via `GET /wallet/transactions`.

### Histórico de disputas

- Cada ação administrativa registra um `DisputeHistory` com data, ação e observações.
- Visível no detalhe da disputa no painel admin.

### Histórico de blockchain

- Cada evento relevante gera um `BlockchainRecord` imutável.
- A tela `blockchain-proof.tsx` exibe a cadeia de hashes do acordo.

### Histórico de score

- Cada mudança de score registra um `ScoreEvent` com tipo, delta e descrição.
- Acessível via `GET /users/:id/score-events` (últimas 50).
- Tela dedicada no mobile com visualização dos eventos.

---

## 18. Score de Confiança

O score de confiança é um número inteiro que representa a reputação do usuário dentro do sistema SeloPay.

### Configuração inicial

- Valor inicial: **100 pontos** (novo usuário).
- Não há limite superior definido no código (teórico ilimitado).
- Não pode ser negativo (limitado a 0 inferiormente).

### Eventos que alteram o score

| Evento (`ScoreEventType`) | Delta | Descrição |
|---|---|---|
| `AGREEMENT_COMPLETED` | +5 | Acordo concluído com sucesso |
| `DISPUTE_WON` | +5 | Contestação decidida a seu favor |
| `AGREEMENT_DISPUTED_RESOLVED` | +3 | Disputa resolvida positivamente |
| `RENEGOTIATION_ACCEPTED` | +2 | Aceitou uma renegociação |
| `DISPUTE_OPENED_AGAINST_USER` | -5 | Uma contestação foi aberta contra você |
| `DISPUTE_LOST` | -10 | Contestação decidida contra você |
| `LATE_PAYMENT` | -3 | Pagamento atrasado |
| `AGREEMENT_DEFAULTED` | -15 | Inadimplência registrada |

### Impacto do score

O score influencia diretamente o **limite do cartão virtual SeloPay**:

| Faixa de score | Limite do cartão |
|---|---|
| < 300 | R$ 0,00 (não ativável) |
| 300 – 499 | R$ 50,00 |
| 500 – 699 | R$ 150,00 |
| 700 – 849 | R$ 300,00 |
| ≥ 850 | R$ 500,00 |

### Observações

- O score é simplificado para fins acadêmicos e não substitui sistemas de credit score reais.
- Não há peso por valor do acordo, frequência de uso, tempo de conta ou outros fatores utilizados em sistemas de crédito reais.
- O score é recalculável: ao ativar ou recalcular o limite do cartão, o sistema usa o score atual do usuário.

---

## 19. Cartão Virtual Baseado em Confiança

O cartão virtual SeloPay é um mecanismo de crédito interno baseado no score de confiança do usuário.

### Implementação

- **Entidade**: `VirtualCard` no schema Prisma.
- **Ativação**: `POST /virtual-card/activate` — cria o cartão com limite calculado pelo score atual.
- **Consulta**: `GET /virtual-card/me` — retorna dados, limite, limite usado e status.
- **Recálculo**: `POST /virtual-card/recalculate-limit` — atualiza o limite após mudança de score.
- **Histórico**: `GET /virtual-card/transactions` — transações de bloqueio/liberação.

### Campos do cartão

| Campo | Descrição |
|---|---|
| `maskedNumber` | Número mascarado (ex: `**** **** **** 4242`) |
| `holderName` | Nome do titular |
| `expiresAt` | Data de vencimento (2 anos a partir da ativação) |
| `creditLimit` | Limite total calculado pelo score |
| `usedLimit` | Limite atualmente comprometido com acordos |
| `status` | INACTIVE / ACTIVE / BLOCKED |

### Tipos de transação do cartão

| Tipo (`CardTransactionType`) | Descrição |
|---|---|
| `GUARANTEE_BLOCK` | Limite bloqueado ao depositar garantia via cartão |
| `GUARANTEE_RELEASE` | Limite devolvido ao cancelar ou reembolsar |
| `GUARANTEE_SETTLE` | Limite liquidado ao liberar valor ao recebedor |

### Relação com disputas

Quando a garantia foi depositada via cartão:
- `RELEASE_TO_RECEIVER`: cria `GUARANTEE_SETTLE` + credita `availableBalance` do recebedor.
- `REFUND_TO_PAYER`: cria `GUARANTEE_RELEASE` + devolve `usedLimit` ao cartão.

### Limitações

- Cartão interno ao sistema, sem integração com bandeiras (Visa, Mastercard).
- Não é emissão real de cartão de crédito.
- Sem autorização, processamento ou liquidação reais.
- Demonstra o conceito de limite dinâmico baseado em reputação — um diferencial arquitetural.

---

## 20. Blockchain no Projeto

### O que existe

O SeloPay implementa um **blockchain interno simulado** por meio da entidade `BlockchainRecord` no banco de dados PostgreSQL.

### Como funciona

Cada evento relevante do sistema chama o `BlockchainService.registerEvent()`, que:
1. Busca o hash do registro mais recente do mesmo acordo (`previousHash`).
2. Calcula o `hash` SHA256 da concatenação do `previousHash` + `eventType` + `JSON.stringify(payload)`.
3. Gera um `txHash` no formato `SELO` + 16 caracteres hexadecimais aleatórios.
4. Persiste o `BlockchainRecord` com status `CONFIRMED`.

### Eventos registrados

| Evento (`BlockchainEventType`) | Quando ocorre |
|---|---|
| `AGREEMENT_CREATED` | Criação do acordo |
| `AGREEMENT_ACCEPTED` | Aceite pelo recebedor |
| `AGREEMENT_REJECTED` | Recusa pelo recebedor |
| `AGREEMENT_CANCELLED` | Cancelamento |
| `AGREEMENT_COMPLETED` | Conclusão com dupla confirmação |
| `GUARANTEE_DEPOSITED_WALLET` | Depósito via carteira |
| `GUARANTEE_DEPOSITED_PIX` | Depósito via Pix simulado |
| `GUARANTEE_DEPOSITED_CARD` | Depósito via cartão |
| `VALUE_RELEASED` | Valor liberado ao recebedor |
| `VALUE_REFUNDED` | Valor reembolsado ao pagador |
| `DISPUTE_OPENED` | Abertura de contestação |
| `ADMIN_DECISION_RELEASE` | Decisão: favor ao recebedor |
| `ADMIN_DECISION_REFUND` | Decisão: reembolso ao pagador |
| `ADMIN_DECISION_RENEGOTIATION` | Decisão: proposta de renegociação |
| `PIX_DEPOSIT_CONFIRMED` | Confirmação de depósito Pix na carteira |

### O que não existe

- **Sem blockchain público**: Sem integração com Ethereum, Bitcoin, Hyperledger, Solana ou qualquer rede distribuída.
- **Sem smart contracts**: Nenhum contrato inteligente implementado.
- **Sem mineração/validação por nós**: O sistema é centralizado.
- **Sem tokenização**: Não há criação de tokens ou NFTs.

### Finalidade acadêmica

O registro blockchain interno demonstra:
- Conceito de encadeamento de hashes para imutabilidade.
- Rastreabilidade de eventos.
- Auditabilidade de transações.
- Prova de existência de eventos em um ponto no tempo.

A tela `blockchain-proof.tsx` no mobile permite ao usuário visualizar a cadeia completa de eventos do acordo com os hashes correspondentes.

---

## 21. Tokenização ou Registro de Ativos

**Não encontrado no MVP atual.**

O SeloPay não implementa tokenização de ativos digitais, NFTs, tokens fungíveis, stablecoins ou qualquer forma de representação digital de ativos em blockchain.

### Como melhoria futura (se relevante para o TCC)

Se o projeto evoluir para uso de blockchain público, a tokenização poderia representar:
- O valor bloqueado em um acordo como um token em custódia (escrow inteligente).
- A "prova de acordo" como um NFT (Non-Fungible Token) de verificação.
- Integração com redes como Ethereum (Sepolia Testnet) ou Hyperledger Fabric para ambiente empresarial.

Esses conceitos são sugeridos como direção futura, não como implementação atual.

---

## 22. Arquitetura Técnica

### Visão geral

O SeloPay é um **monorepo pnpm** com workspaces, contendo dois aplicativos principais:

```
SeloPay/
├── apps/
│   ├── api/          # Backend NestJS (Node.js + TypeScript)
│   └── mobile/       # Frontend React Native com Expo
├── packages/         # Pacotes compartilhados (estrutura criada, sem conteúdo no MVP)
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json (raiz — scripts globais e devDependencies compartilhadas)
└── .env              # Variáveis de ambiente
```

### Backend (apps/api)

- **Framework**: NestJS 10 (arquitetura modular, injeção de dependência, decorators)
- **Porta**: 3333
- **Prefixo global**: `/api`
- **Documentação**: Swagger disponível em `/docs`
- **ORM**: Prisma 5.9.1 (type-safe, migrations automáticas)
- **Banco**: PostgreSQL 16 via Docker (porta 5435)
- **Autenticação**: JWT com `passport-jwt` (dois contextos: usuário e admin)
- **Validação**: `class-validator` + `class-transformer` com `ValidationPipe` global
- **Rate limiting**: `@nestjs/throttler` — 60 requests/minuto
- **Upload de arquivos**: `multer` (armazenamento local)

#### Organização modular do backend

```
src/
├── main.ts                     # Bootstrap, config global
├── app.module.ts               # Raiz — importa todos os módulos
├── prisma/                     # PrismaService global
├── common/
│   ├── constants/              # safe-user-select (campos seguros a retornar)
│   ├── decorators/             # @CurrentUser()
│   ├── filters/                # HttpExceptionFilter global
│   ├── guards/                 # JwtAuthGuard, AdminJwtGuard
│   └── config/                 # Multer config
└── modules/
    ├── auth/                   # Cadastro, login, /me
    ├── users/                  # Perfil, busca por SeloKey, score-events
    ├── wallet/                 # Saldo, transações, depósitos Pix, crédito demo
    ├── agreements/             # Máquina de estados completa de acordos
    ├── disputes/               # Contestações, evidências, respostas
    ├── admin/                  # Portal admin, decisões, dashboard
    ├── score/                  # ScoreService global (registra e atualiza score)
    ├── blockchain/             # BlockchainService global (registra eventos SHA256)
    └── virtual-card/           # Cartão virtual com limite por score
```

### Frontend Mobile (apps/mobile)

- **Framework**: Expo 54 + React Native 0.81
- **Roteamento**: Expo Router 6 (file-based routing, semelhante ao Next.js)
- **Linguagem**: TypeScript 5.9
- **Gerenciamento de estado**: Context API (AuthContext, AdminAuthContext, NotificationsContext)
- **HTTP**: Axios com interceptores de 401 e timeout
- **Armazenamento local**: `expo-secure-store` (JWT tokens)
- **Ícones**: `@expo/vector-icons` (Ionicons)

#### Estrutura do mobile

```
apps/mobile/
├── app/                        # Telas (Expo Router file-based)
│   ├── (auth)/                 # Telas de autenticação
│   ├── (tabs)/                 # Abas principais do app
│   ├── (admin)/                # Telas do portal admin
│   └── agreements/             # Telas de acordos
├── src/
│   ├── contexts/               # AuthContext, AdminAuthContext, NotificationsContext
│   ├── services/               # api.ts (Axios), adminApi
│   ├── types/                  # Tipos TypeScript globais
│   ├── theme/                  # Colors, Typography, Spacing, Radius, Shadows
│   ├── utils/                  # formatters, helpers
│   └── components/             # Componentes reutilizáveis
└── assets/                     # Imagens e fontes
```

### Fluxo de dados

```
Mobile (Expo Router)
    ↓ HTTP (Axios + JWT)
API (NestJS)
    ↓ Prisma ORM
PostgreSQL 16
    ↑ (retorna dados)
NestJS serializa → JSON
    ↑
Mobile atualiza estado (Context API)
    ↑
Tela re-renderiza
```

### Docker

- `docker-compose.yml` na raiz inicia o PostgreSQL 16 na porta 5435.
- Banco de dados: `selopay`, usuário: `selopay`, senha: `selopay_dev_pass`.
- Volumes nomeados para persistência de dados.

---

## 23. Tecnologias Usadas

| Tecnologia | Versão encontrada | Função no projeto |
|---|---|---|
| **TypeScript** | 5.3.3 (API) / 5.9.2 (Mobile) | Tipagem estática em todo o projeto |
| **Node.js** | ≥ 18 (inferido) | Runtime do backend |
| **NestJS** | 10.3.0 | Framework backend modular com DI e decorators |
| **Prisma** | 5.9.1 | ORM type-safe, migrations, geração de tipos |
| **PostgreSQL** | 16 | Banco de dados relacional principal |
| **Docker / Docker Compose** | — | Containerização do banco de dados |
| **pnpm** | 8+ | Gerenciador de pacotes e workspaces do monorepo |
| **Expo** | 54.0.35 | Plataforma de desenvolvimento React Native |
| **React Native** | 0.81.5 | Framework de desenvolvimento mobile |
| **React** | 19.1.0 | Biblioteca de UI |
| **Expo Router** | 6.0.24 | Roteamento file-based para mobile |
| **Axios** | 1.7.7 | Cliente HTTP com interceptores |
| **expo-secure-store** | — | Armazenamento seguro de tokens JWT |
| **passport / passport-jwt** | — | Autenticação com estratégias JWT |
| **bcryptjs** | 2.4.3 | Hash seguro de senhas |
| **class-validator** | 0.14.1 | Validação de DTOs com decorators |
| **class-transformer** | 0.5.1 | Transformação e serialização de objetos |
| **@nestjs/swagger** | 7.2.0 | Documentação automática de API (OpenAPI) |
| **multer** | 2.2.0 | Upload de arquivos (evidências de disputa) |
| **nanoid** | 3.3.7 | Geração de IDs únicos |
| **@nestjs/throttler** | 5.1.1 | Rate limiting (60 req/min) |
| **Jest / ts-jest** | 29.x | Framework de testes |
| **@expo/vector-icons** | — | Biblioteca de ícones (Ionicons) |

---

## 24. Banco de Dados e Entidades Principais

### 24.1 Entidades

#### User

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `name` | String | Nome completo |
| `cpf` | String (unique) | CPF completo (nunca exposto via API) |
| `cpfMasked` | String | CPF mascarado: `111.***.***-44` |
| `email` | String (unique) | E-mail do usuário |
| `passwordHash` | String | Senha hasheada com bcrypt |
| `seloKey` | String (unique) | Chave pública do usuário: `@nome6HEX` |
| `score` | Int (default: 100) | Score de confiança atual |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Última atualização |

**Relacionamentos**: Wallet (1:1), acordos como pagador, acordos como recebedor, confirmações, disputas abertas, respostas a disputas, negociações propostas, eventos de score, pagamentos simulados, depósitos Pix, registros blockchain, cartão virtual.

#### Wallet

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `userId` | String (unique) | Referência ao usuário |
| `availableBalance` | Decimal (default: 0) | Saldo livre |
| `blockedBalance` | Decimal (default: 0) | Saldo comprometido |

**Relacionamentos**: User (cascade delete), WalletTransaction.

#### Agreement

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `type` | AgreementType | `GUARANTEED` |
| `payerId` | String | Referência ao pagador |
| `receiverId` | String | Referência ao recebedor |
| `amount` | Decimal | Valor do acordo |
| `description` | String | Descrição do combinado |
| `dueDate` | DateTime | Data de vencimento |
| `status` | AgreementStatus | Status atual do acordo |
| `financialStatus` | FinancialStatus | Status financeiro |
| `expiresAt` | DateTime | Expiração do aceite (criação + 1h) |
| `acceptedAt` | DateTime? | Data do aceite |
| `completedAt` | DateTime? | Data da conclusão |

**Relacionamentos**: Payer (User), Receiver (User), AgreementConfirmation, Dispute, Negotiation, SimulatedPayment (1:1), WalletTransaction, BlockchainRecord, CardTransaction.

#### Dispute

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `agreementId` | String | Acordo contestado |
| `openedById` | String | Quem abriu |
| `title` | String | Título da contestação |
| `description` | String | Descrição detalhada |
| `status` | DisputeStatus | Status atual |
| `adminDecision` | AdminDecisionType? | Decisão tomada pelo admin |
| `adminNotes` | String? | Observações do admin |
| `resolvedAt` | DateTime? | Data da resolução |

**Relacionamentos**: Agreement, openedBy (User), DisputeEvidence, DisputeHistory, DisputeResponse.

#### BlockchainRecord

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `agreementId` | String? | Acordo relacionado (opcional) |
| `userId` | String? | Usuário relacionado (opcional) |
| `eventType` | BlockchainEventType | Tipo do evento |
| `payload` | Json | Dados do evento |
| `previousHash` | String | Hash do registro anterior |
| `hash` | String (unique) | Hash SHA256 do registro atual |
| `txHash` | String | Hash de transação: `SELO` + 16hex |
| `status` | String (default: CONFIRMED) | Status do registro |

#### ScoreEvent

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `userId` | String | Usuário afetado |
| `type` | ScoreEventType | Tipo do evento |
| `delta` | Int | Variação de pontos (+/-) |
| `description` | String | Descrição do evento |
| `agreementId` | String? | Acordo relacionado |

#### VirtualCard

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `userId` | String (unique) | Um cartão por usuário |
| `status` | VirtualCardStatus | INACTIVE / ACTIVE / BLOCKED |
| `creditLimit` | Decimal | Limite total calculado por score |
| `usedLimit` | Decimal (default: 0) | Limite atualmente utilizado |
| `maskedNumber` | String | Número mascarado |
| `holderName` | String | Nome do titular |
| `expiresAt` | DateTime | Data de expiração (2 anos) |

#### AdminUser

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (CUID) | Identificador único |
| `email` | String (unique) | E-mail do admin |
| `passwordHash` | String | Senha hasheada |
| `name` | String | Nome do admin |

**Nota**: AdminUser é uma entidade separada de User, com JWT próprio.

### 24.2 Tabela Resumo

| Entidade | Descrição | Relacionamentos Principais | Importância |
|---|---|---|---|
| `User` | Usuário do sistema | Wallet, Agreements, Disputes, ScoreEvent, VirtualCard | Central — toda ação é de um usuário |
| `Wallet` | Carteira digital | User (1:1), WalletTransaction | Controle financeiro simulado |
| `WalletTransaction` | Movimentação da carteira | Wallet, Agreement | Rastreabilidade financeira |
| `Agreement` | Acordo entre partes | User×2, Dispute, Negotiation, SimulatedPayment | Entidade principal do produto |
| `AgreementConfirmation` | Confirmação de cumprimento | Agreement, User | Viabiliza a dupla confirmação |
| `Dispute` | Contestação do acordo | Agreement, User, Evidence, History | Resolução de conflitos |
| `DisputeEvidence` | Evidência da contestação | Dispute | Provas na disputa |
| `DisputeHistory` | Histórico de ações na disputa | Dispute | Auditabilidade |
| `DisputeResponse` | Resposta da parte contestada | Dispute, User | Contraditório digital |
| `Negotiation` | Proposta de renegociação | Agreement, User | Renegociação de prazo |
| `SimulatedPayment` | Pagamento Pix simulado | Agreement, User | Depósito de garantia via Pix |
| `PixDeposit` | Depósito Pix na carteira | User | Recarga da carteira |
| `ScoreEvent` | Evento que altera score | User | Reputação do usuário |
| `BlockchainRecord` | Registro imutável de eventos | Agreement, User | Rastreabilidade e auditoria |
| `VirtualCard` | Cartão virtual baseado em score | User, CardTransaction | Crédito por confiança |
| `CardTransaction` | Transação do cartão | VirtualCard, Agreement | Garantia via cartão |
| `AdminUser` | Usuário administrador | — | Resolução manual de disputas |

---

## 25. Endpoints da API

> Prefixo global: `/api`. Swagger: `http://localhost:3333/docs`.
> JWT obrigatório em todos os endpoints exceto Auth e Admin Login.

### 25.1 Autenticação (`/auth`)

| Método | Rota | Finalidade | Entrada | Saída |
|---|---|---|---|---|
| POST | `/auth/register` | Cadastrar usuário | `{ name, cpf, email, password }` | `{ user, token }` |
| POST | `/auth/login` | Login | `{ email, password }` | `{ user, token }` |
| GET | `/auth/me` | Dados do usuário logado | — (JWT) | User |

### 25.2 Usuários (`/users`)

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/users/me` | Perfil do usuário logado |
| GET | `/users/by-key/:seloKey` | Buscar usuário por SeloKey |
| GET | `/users/:id` | Buscar usuário por ID |
| GET | `/users/:id/score-events` | Histórico de score (últimas 50) |

### 25.3 Carteira (`/wallet`)

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/wallet` | Saldo disponível + bloqueado |
| GET | `/wallet/transactions` | Histórico de transações (últimas 100) |
| POST | `/wallet/deposits/pix` | Gerar Pix para depósito na carteira |
| POST | `/wallet/deposits/:id/simulate-confirm` | Confirmar Pix (demo) |
| POST | `/wallet/simulate-credit` | Adicionar saldo (apenas para demo) |

### 25.4 Acordos (`/agreements`)

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/agreements` | Criar novo acordo |
| GET | `/agreements` | Listar acordos do usuário (filtro por status) |
| GET | `/agreements/:id` | Detalhe do acordo |
| POST | `/agreements/:id/accept` | Recebedor aceita |
| POST | `/agreements/:id/reject` | Recebedor recusa |
| POST | `/agreements/:id/simulate-deposit` | Pagador deposita garantia (carteira) |
| POST | `/agreements/:id/simulate-deposit-pix` | Pagador deposita garantia (Pix) |
| POST | `/agreements/:id/simulate-deposit-card` | Pagador deposita garantia (Cartão) |
| POST | `/agreements/:id/confirm` | Confirmar cumprimento (pagador ou recebedor) |
| POST | `/agreements/:id/negotiate` | Propor renegociação (nova data) |
| POST | `/agreements/:id/negotiate/accept` | Aceitar renegociação |
| POST | `/agreements/:id/negotiate/reject` | Recusar renegociação |

### 25.5 Disputas (`/disputes`)

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/disputes` | Abrir contestação |
| GET | `/disputes` | Minhas disputas |
| GET | `/disputes/:id` | Detalhe com evidências e respostas |
| POST | `/disputes/:id/evidence` | Enviar evidências (upload) |
| POST | `/disputes/:id/respond` | Responder contestação |

### 25.6 Cartão Virtual (`/virtual-card`)

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/virtual-card/me` | Dados do cartão do usuário |
| POST | `/virtual-card/activate` | Ativar cartão |
| POST | `/virtual-card/recalculate-limit` | Recalcular limite |
| GET | `/virtual-card/transactions` | Histórico de transações do cartão |

### 25.7 Admin (`/admin`)

| Método | Rota | Finalidade | Auth |
|---|---|---|---|
| POST | `/admin/auth/login` | Login do administrador | Público |
| GET | `/admin/dashboard` | Métricas gerais | AdminJWT |
| GET | `/admin/users` | Listar todos os usuários | AdminJWT |
| GET | `/admin/agreements` | Listar todos os acordos | AdminJWT |
| GET | `/admin/disputes` | Listar disputas (filtro por status) | AdminJWT |
| GET | `/admin/disputes/:id` | Detalhe completo da disputa | AdminJWT |
| POST | `/admin/disputes/:id/decision` | Registrar decisão | AdminJWT |

---

## 26. Telas e Experiência do Usuário

### 26.1 Telas do App Mobile

#### Autenticação (`(auth)/`)

| Tela | Arquivo | Descrição |
|---|---|---|
| Boas-vindas | `welcome.tsx` | Apresentação do app com opções de login/cadastro |
| Login | `login.tsx` | Formulário de login com hint de usuário demo |
| Cadastro | `register.tsx` | Formulário com máscara de CPF |

#### Abas principais (`(tabs)/`)

| Tela | Arquivo | Descrição |
|---|---|---|
| Home | `home.tsx` | Dashboard: saldo resumido, ações rápidas, últimos 5 acordos |
| Carteira | `wallet.tsx` | Saldo disponível/bloqueado, histórico, cartão SeloPay, botão depositar |
| Acordos | `agreements.tsx` | Lista filtrada por status: Todos, Ativos, Pendentes, Em disputa, Concluídos |
| Perfil | `profile.tsx` | Avatar com iniciais, dados pessoais, score, SeloKey copiável, logout |

#### Acordos (`agreements/`)

| Tela | Arquivo | Descrição |
|---|---|---|
| Criar acordo | `create.tsx` | Formulário principal de criação |
| Detalhe do acordo | `[id].tsx` | Status, partes, valor, histórico, ações contextuais conforme estado |

#### Outras telas

| Tela | Arquivo | Descrição |
|---|---|---|
| Depósito Pix (carteira) | `deposit.tsx` | Gerar e confirmar Pix de depósito |
| Depósito Pix (garantia) | `deposit-pix.tsx` | QR Code e copia-e-cola fake para garantia |
| Score | `score.tsx` | Gauge visual do score + histórico de eventos |
| Cartão Virtual | `virtual-card.tsx` | Dados do cartão, limite disponível, histórico, ativação |
| Blockchain Proof | `blockchain-proof.tsx` | Visualização da cadeia de hashes do acordo |
| Notificações | `notifications.tsx` | Centro de notificações internas |

#### Admin (`(admin)/`)

| Tela | Arquivo | Descrição |
|---|---|---|
| Lista de disputas | `disputes.tsx` | Disputas ordenadas por urgência (OPEN > UNDER_REVIEW > RESOLVED) |
| Detalhe da disputa | `dispute/[id].tsx` | Evidências, histórico, resposta da outra parte, registrar decisão |

### 26.2 Identidade Visual

O SeloPay tem identidade visual própria, sem copiar outras marcas. Paleta de cores:

| Cor | Hex | Uso |
|---|---|---|
| Primary | `#0A4F5E` | Cor principal, cabeçalhos, botões primários |
| Secondary | `#12919F` | Cor secundária, destaques |
| Accent | `#E8931E` | Laranja para avisos e destaques de atenção |
| Background | `#F3F6FA` | Fundo das telas |
| Surface | `#FFFFFF` | Cartões e superfícies |
| Error | `#E84040` | Erros e ações destrutivas |
| Success | `#27AE60` | Confirmações e status positivos |
| Warning | `#E8931E` | Avisos |

**Filosofia de UX**: Interface limpa, moderna e semelhante a apps de banco digital, com foco em clareza das informações financeiras e segurança visual. Pouco texto, ícones descritivos, hierarquia visual clara, feedback imediato ao usuário.

**Componentes reutilizáveis implementados**: Button (3 variantes), Input, Card, LoadingScreen, FloatingTabBar (navegação flutuante), ScoreGauge, SeloPayLogo.

---

## 27. Fluxos Detalhados

### 27.1 Fluxo de Cadastro e Login

```
1. Usuário acessa a tela de boas-vindas (welcome.tsx)
2. Seleciona "Criar conta"
3. Preenche: Nome, CPF (com máscara automática), E-mail, Senha
4. POST /auth/register
   → API valida campos (class-validator)
   → Verifica CPF único e e-mail único
   → Gera SeloKey: @{primeironome} + 6 hex únicos (retry até 5x)
   → Cria User com passwordHash (bcrypt salt 10)
   → Cria Wallet vinculada (availableBalance=0, blockedBalance=0)
   → Retorna { user, token (JWT 7d) }
5. AuthContext armazena token em SecureStore e user em memória
6. App redireciona para (tabs)/home
```

### 27.2 Fluxo de Criação de Acordo Simples (sem garantia financeira)

```
1. Usuário acessa (tabs)/agreements → botão "Novo acordo"
2. Preenche: SeloKey do recebedor, valor (opcional/0), descrição, data de vencimento
3. POST /agreements
   → API valida: receiver existe, receiver ≠ payer, dueDate > now
   → Cria Agreement com status=PENDING_ACCEPTANCE, expiresAt=(+1h)
   → Registra BlockchainRecord AGREEMENT_CREATED
4. Acordo aparece na lista do pagador como "Aguardando aceite"
5. Recebedor vê o acordo e pode aceitar ou recusar
```

### 27.3 Fluxo de Criação de Acordo com Garantia

```
1. Pagador cria acordo informando valor > 0
2. Recebedor aceita → POST /agreements/:id/accept
   → status = WAITING_DEPOSIT
   → financialStatus = WAITING_SIMULATED_DEPOSIT
   → SimulatedPayment criado (Pix fake gerado)
   → BlockchainRecord AGREEMENT_ACCEPTED
3. Pagador vê opções de depósito no detalhe do acordo
4. Pagador escolhe fonte (wallet/Pix/cartão) e deposita
5. API bloqueia o valor
   → status = ACTIVE
   → financialStatus = VALUE_HELD
   → BlockchainRecord GUARANTEE_DEPOSITED_*
```

### 27.4 Fluxo de Aceite

```
1. Recebedor vê acordo com status PENDING_ACCEPTANCE
2. Acessa detalhe do acordo ([id].tsx)
3. Toca em "Aceitar acordo"
4. POST /agreements/:id/accept
   → Validação: caller === receiverId, status === PENDING_ACCEPTANCE
   → Atualiza status → WAITING_DEPOSIT
   → Cria SimulatedPayment com fakePixCode e fakeQrCode
   → Registra blockchain AGREEMENT_ACCEPTED
5. Pagador recebe feedback (tela atualizada automaticamente)
```

### 27.5 Fluxo de Recusa

```
1. Recebedor acessa o detalhe do acordo
2. Toca em "Recusar acordo"
3. POST /agreements/:id/reject
   → Validação: caller === receiverId, status === PENDING_ACCEPTANCE
   → status = REJECTED
   → Registra blockchain AGREEMENT_REJECTED
4. Acordo encerrado para ambas as partes
```

### 27.6 Fluxo de Depósito Simulado (via carteira)

```
1. Pagador acessa detalhe do acordo (status WAITING_DEPOSIT)
2. Toca em "Depositar garantia"
3. POST /agreements/:id/simulate-deposit
   → Validação: caller === payerId, status === WAITING_DEPOSIT
   → Verifica: payerWallet.availableBalance >= amount
   → Transação atômica:
      · wallet.availableBalance -= amount
      · wallet.blockedBalance += amount
      · WalletTransaction tipo VALUE_HELD criada
      · agreement.status = ACTIVE
      · agreement.financialStatus = VALUE_HELD
      · SimulatedPayment.status = CONFIRMED
      · BlockchainRecord GUARANTEE_DEPOSITED_WALLET
4. Acordo passa para ACTIVE
```

### 27.7 Fluxo de Confirmação Dupla

```
1. Acordo está ACTIVE com VALUE_HELD
2. Pagador confirma que cumpriu:
   POST /agreements/:id/confirm { confirmationType: "OBLIGATION_FULFILLED" }
   → Cria AgreementConfirmation (role=PAYER)
   → Verifica se ambas as confirmações existem → ainda NÃO
3. Recebedor confirma que está pronto:
   POST /agreements/:id/confirm { confirmationType: "READY_TO_RECEIVE" }
   → Cria AgreementConfirmation (role=RECEIVER)
   → Verifica se ambas as confirmações existem → SIM
   → Transação atômica de liberação:
      · payerWallet.blockedBalance -= amount
      · receiverWallet.availableBalance += amount
      · WalletTransactions: VALUE_RELEASED (payer) + VALUE_RECEIVED (receiver)
      · agreement.status = COMPLETED
      · agreement.financialStatus = VALUE_RELEASED
      · agreement.completedAt = now
   → Score: +5 para ambos (AGREEMENT_COMPLETED)
   → BlockchainRecord VALUE_RELEASED e AGREEMENT_COMPLETED
4. Acordo aparece como CONCLUÍDO para ambas as partes
```

### 27.8 Fluxo de Contestação

```
1. Qualquer parte abre contestação enquanto acordo está ACTIVE
2. POST /disputes { agreementId, title, description }
   → Validação: participante do acordo, status ACTIVE ou IN_NEGOTIATION
   → Cria Dispute com status=OPEN
   → Se GUARANTEED: financialStatus = VALUE_LOCKED_BY_DISPUTE
   → agreement.status = IN_DISPUTE
   → Score: -5 para quem foi contestado (DISPUTE_OPENED_AGAINST_USER)
   → BlockchainRecord DISPUTE_OPENED
3. Parte pode enviar evidências:
   POST /disputes/:id/evidence (multipart/form-data)
4. Outra parte responde:
   POST /disputes/:id/respond { message } + evidências opcionais
5. Ambas as partes aguardam decisão do admin
```

### 27.9 Fluxo de Resolução Manual pelo Admin

```
1. Admin faz login: POST /admin/auth/login
2. Acessa lista de disputas: GET /admin/disputes?status=OPEN
3. Abre detalhe: GET /admin/disputes/:id
4. Analisa evidências, respostas, histórico
5. Registra decisão: POST /admin/disputes/:id/decision
   { decision: "RELEASE_TO_RECEIVER", notes: "..." }
   
   Se RELEASE_TO_RECEIVER:
   → payerWallet.blockedBalance -= amount
   → receiverWallet.availableBalance += amount
   → dispute.status = RESOLVED
   → agreement.status = COMPLETED
   → Score: +5 receiver, -10 payer
   → BlockchainRecord ADMIN_DECISION_RELEASE
   
   Se REFUND_TO_PAYER:
   → payerWallet.blockedBalance -= amount
   → payerWallet.availableBalance += amount
   → dispute.status = RESOLVED
   → agreement.status = CANCELLED
   → Score: +5 payer, -10 receiver
   → BlockchainRecord ADMIN_DECISION_REFUND
   
   Se PROPOSE_RENEGOTIATION:
   → Cria Negotiation com newDueDate = +7 dias
   → dispute.status = UNDER_REVIEW
   → agreement.status = IN_NEGOTIATION
   → BlockchainRecord ADMIN_DECISION_RENEGOTIATION
```

### 27.10 Fluxo de Liberação para Carteira

```
(Ocorre dentro do fluxo de Confirmação Dupla ou Decisão Admin)

Resultado final:
→ receiverWallet.availableBalance aumenta em `amount`
→ Tipo de transação: VALUE_RECEIVED
→ O recebedor vê o valor no saldo disponível da carteira
→ O saldo pode ser usado em futuros acordos como garantia

Limitação MVP: não há saque real.
```

### 27.11 Fluxo de Score e Reputação

```
Ao criar conta:
  → score = 100

Ao concluir um acordo (qualquer participante):
  → ScoreService.recordEvent(userId, AGREEMENT_COMPLETED, +5)
  → User.score += 5

Ao perder uma disputa:
  → ScoreService.recordEvent(userId, DISPUTE_LOST, -10)
  → User.score -= 10

Ao abrir uma contestação contra alguém:
  → ScoreService.recordEvent(contestadoId, DISPUTE_OPENED_AGAINST_USER, -5)
  → contestado.score -= 5

ScoreEvent sempre registra: userId, type, delta, description, agreementId?
Disponível em: GET /users/:id/score-events (últimas 50)
Tela mobile: score.tsx com gauge visual
```

---

## 28. Diferenciais do Projeto

| Diferencial | Descrição |
|---|---|
| **Acordos digitais acessíveis** | Formalização de compromissos sem necessidade de contratos jurídicos ou plataformas complexas |
| **Garantia simulada** | Conceito de escrow simulado para proteger ambas as partes em acordos com valor |
| **Dupla confirmação** | A liberação do valor exige consentimento explícito das duas partes |
| **Valor travado em disputa** | Enquanto há contestação, nenhuma parte pode mover o dinheiro unilateralmente |
| **Três fontes de garantia** | Carteira interna, Pix simulado e cartão virtual — mesma proteção, múltiplas origens |
| **Reputação baseada em comportamento** | Score gerado a partir de ações reais no sistema, não por declaração |
| **Cartão de crédito por confiança** | Limite dinâmico calculado automaticamente pelo score |
| **Blockchain interno** | Cadeia de hashes SHA256 para auditabilidade e rastreabilidade sem depender de rede pública |
| **Resolução estruturada de conflitos** | Disputa formal com evidências, contraditório e decisão administrativa |
| **Renegociação controlada** | Proposta e aceite de nova data sem encerrar o acordo existente |
| **SeloKey como identidade** | Chave pública amigável que substitui CPF nas transações |
| **Separação admin/usuário** | JWTs distintos, acesso e permissões completamente separados |
| **Aplicabilidade cotidiana** | Pensado para acordos simples do dia a dia, não apenas contratos formais |

---

## 29. Limitações Atuais do MVP

| Limitação | Descrição |
|---|---|
| **Pix 100% simulado** | Não há integração com o sistema Pix real do Banco Central |
| **Sem movimentação financeira real** | Nenhum centavo real é movimentado em qualquer operação |
| **Sem integração com PSP** | Não há conta em Pagamento Instantâneo (ex: Nubank, PicPay, Mercado Pago) |
| **Blockchain não distribuído** | O registro em "blockchain" é uma cadeia de hashes em banco SQL, não em rede pública |
| **Sem smart contracts** | Nenhuma lógica on-chain |
| **Resolução manual** | Todas as disputas são resolvidas manualmente pelo administrador |
| **Sem KYC real** | Não há verificação de identidade real (apenas CPF como campo de texto) |
| **Score simplificado** | Não considera histórico temporal, frequência, valor dos acordos, análise de comportamento etc. |
| **Cartão virtual conceitual** | O "cartão" não tem integração com bandeira, processadora ou emissor |
| **Notificações sem push real** | Não há integração com FCM (Firebase) ou APNs para notificações push |
| **Armazenamento de evidências local** | Uploads ficam em `/uploads` no servidor, sem serviço de cloud |
| **Sem testes automatizados completos** | A estrutura Jest existe mas os testes de integração não foram completados |
| **Sem CI/CD** | Não há pipeline automatizado de build, teste e deploy |
| **Admin único centralizado** | Um único admin global, sem controle de acesso por módulo ou time |
| **Expiração manual** | A expiração de acordos é verificada on-demand (ao listar), não por job agendado |
| **Sem logs de auditoria de sistema** | Além do blockchain interno, não há log estruturado de eventos de infraestrutura |
| **Sem compliance financeiro** | Ausência de controles de PLD/AML, registro em órgãos reguladores etc. |
| **Tipo de acordo único** | `AgreementType` contém apenas `GUARANTEED` — não há flag para acordo sem garantia financeira |

---

## 30. Possíveis Melhorias Futuras

### Melhorias Técnicas

| Melhoria | Descrição |
|---|---|
| **Pix sandbox (Banco Central)** | Integração com ambiente de homologação do SPI |
| **Webhook de confirmação Pix** | Confirmação automática via callback |
| **Jobs agendados** | Expiração automática de acordos via cron job (NestJS @nestjs/schedule) |
| **Notificações push reais** | Integração com Firebase Cloud Messaging e APNs |
| **WebSockets** | Atualizações em tempo real no status do acordo |
| **Testes automatizados** | Suite completa de testes unitários e de integração |
| **CI/CD** | Pipeline GitHub Actions / GitLab CI |
| **Armazenamento S3** | Upload de evidências em AWS S3 ou Cloudflare R2 |
| **Logs estruturados** | Integração com OpenTelemetry, Datadog ou ELK Stack |
| **Containerização completa** | Dockerizar API e mobile builder |
| **Cache Redis** | Cache de sessão e rate-limiting mais robusto |
| **Blockchain testnet** | Integração com Ethereum Sepolia ou Polygon Mumbai para registro público |

### Melhorias de Produto

| Melhoria | Descrição |
|---|---|
| **KYC progressivo** | Verificação de identidade em etapas conforme o usuário aumenta o uso |
| **Acordo simples (sem garantia)** | Tipo distinto no schema para acordos apenas de registro |
| **Templates de acordos** | Modelos pré-prontos para freelances, empréstimos, etc. |
| **Chat formal de disputa** | Comunicação estruturada entre as partes durante a contestação |
| **Análise antifraude** | Detecção de padrões suspeitos com ML |
| **Exportação de comprovante** | PDF do acordo e do histórico para fins legais informais |
| **Score multi-fator** | Considerar valor, frequência, histórico temporal e diversidade de acordos |
| **Análise de crédito mais robusta** | Algoritmo de score mais sofisticado para limite do cartão |
| **Múltiplos admins** | Controle de acesso por função no painel administrativo |
| **Versão web** | Dashboard web para gerenciar acordos em desktop |
| **Internacionalização** | Suporte a outros idiomas e moedas |

### Melhorias Acadêmicas

| Melhoria | Descrição |
|---|---|
| **Estudo de caso** | Aplicação piloto com grupo real de usuários |
| **Análise comparativa** | Comparar SeloPay com soluções similares existentes |
| **Modelagem formal** | Diagramas UML completos (casos de uso, sequência, classes) |
| **Avaliação de usabilidade** | Testes com usuários reais e análise qualitativa |
| **Documentação de API OpenAPI** | Exportação e publicação do Swagger |
| **Artigo científico** | Submissão para conferência de computação (SBSI, SBQS, WTDBD) |

---

## 31. Como Apresentar o SeloPay em um TCC de Ciência da Computação

### Tema possível

**Sistemas de Confiança Digital**: Desenvolvimento de plataformas que usam tecnologia para formalizar, registrar e auditar acordos entre pessoas sem a necessidade de intermediários tradicionais.

### Problema de pesquisa

*Como uma plataforma de software pode reduzir as incertezas e riscos em acordos informais entre pessoas físicas, utilizando mecanismos digitais de registro, garantia simulada e reputação?*

### Hipótese / Motivação

A digitalização de acordos informais, com suporte a garantia simulada, dupla confirmação e sistema de reputação, pode aumentar a confiança entre as partes e reduzir conflitos em transações cotidianas não formalizadas.

### Objetivo Geral

Desenvolver e documentar o SeloPay — uma plataforma de acordos digitais com garantia simulada — como prova de conceito de infraestrutura de confiança digital entre pessoas físicas.

### Objetivos Específicos

1. Identificar os principais problemas dos acordos informais entre pessoas.
2. Modelar um sistema de acordos digitais com ciclo de vida completo.
3. Implementar uma API RESTful modular com NestJS e PostgreSQL.
4. Desenvolver um aplicativo mobile multiplataforma com React Native/Expo.
5. Implementar mecanismo de garantia simulada com dupla confirmação.
6. Implementar sistema de score de confiança baseado em comportamento.
7. Implementar registro imutável de eventos com cadeia de hashes SHA256.
8. Documentar as limitações do MVP e propor melhorias futuras.

### Metodologia

1. **Revisão bibliográfica**: Sistemas de pagamento, escrow digital, reputação online, blockchain para rastreabilidade.
2. **Levantamento de requisitos**: Funcional e não funcional baseado no problema mapeado.
3. **Modelagem**: Diagrama entidade-relacionamento, casos de uso, máquina de estados.
4. **Arquitetura**: Definição do stack tecnológico e organização em monorepo.
5. **Implementação**: Desenvolvimento iterativo com NestJS (API) e Expo (mobile).
6. **Testes**: Validação manual dos fluxos principais de ponta a ponta.
7. **Documentação**: Geração automática via Swagger + este dossiê técnico.
8. **Análise de resultados**: Avaliação do que foi alcançado, limitações e trabalhos futuros.

### Sugestões de título para o TCC

- *"SeloPay: Plataforma Digital para Registro e Garantia Simulada de Acordos entre Pessoas"*
- *"Uma Plataforma de Confiança Digital para Formalização de Acordos Informais"*
- *"Desenvolvimento de um Sistema de Acordos Digitais com Garantia Simulada e Reputação de Usuários"*
- *"SeloPay: Infraestrutura Digital de Confiança para Acordos Informais entre Pessoas Físicas"*
- *"Formalizando Combinados: Uma Plataforma de Acordos Digitais com Escrow Simulado e Score de Confiança"*

---

## 32. Requisitos Funcionais

| Código | Requisito | Status |
|---|---|---|
| RF01 | O sistema deve permitir o cadastro de novos usuários com nome, CPF, e-mail e senha | Implementado |
| RF02 | O sistema deve gerar automaticamente uma SeloKey única para cada usuário no cadastro | Implementado |
| RF03 | O sistema deve permitir autenticação de usuários com e-mail e senha via JWT | Implementado |
| RF04 | O sistema deve criar automaticamente uma carteira digital para cada usuário no cadastro | Implementado |
| RF05 | O sistema deve permitir busca de usuário por SeloKey para criação de acordos | Implementado |
| RF06 | O sistema deve permitir a criação de acordos digitais entre dois usuários distintos | Implementado |
| RF07 | O sistema deve registrar para cada acordo: partes, valor, descrição, prazo e data de criação | Implementado |
| RF08 | O sistema deve permitir que o recebedor aceite ou recuse um acordo pendente | Implementado |
| RF09 | O sistema deve expirar automaticamente acordos não respondidos após 1 hora | Implementado (verificação on-demand) |
| RF10 | O sistema deve aceitar depósito de garantia via saldo da carteira interna | Implementado |
| RF11 | O sistema deve aceitar depósito de garantia via Pix simulado | Implementado |
| RF12 | O sistema deve aceitar depósito de garantia via cartão virtual SeloPay | Implementado |
| RF13 | O sistema deve bloquear o valor depositado enquanto o acordo está ativo | Implementado |
| RF14 | O sistema deve permitir que cada parte confirme o cumprimento do acordo | Implementado |
| RF15 | O sistema deve liberar o valor apenas quando ambas as partes confirmarem | Implementado |
| RF16 | O sistema deve creditar o valor na carteira do recebedor após a liberação | Implementado |
| RF17 | O sistema deve permitir que qualquer participante abra uma contestação em acordo ativo | Implementado |
| RF18 | O sistema deve travar o valor financeiro ao abrir uma contestação | Implementado |
| RF19 | O sistema deve permitir envio de evidências (arquivos) na contestação | Implementado |
| RF20 | O sistema deve permitir que a parte contestada responda à contestação | Implementado |
| RF21 | O sistema deve disponibilizar painel administrativo com acesso separado | Implementado |
| RF22 | O sistema deve permitir que o administrador visualize disputas, usuários e acordos | Implementado |
| RF23 | O sistema deve permitir que o administrador registre decisões em disputas | Implementado |
| RF24 | O sistema deve registrar eventos de reputação (score) a cada ação relevante | Implementado |
| RF25 | O sistema deve calcular e disponibilizar o score de confiança do usuário | Implementado |
| RF26 | O sistema deve disponibilizar cartão virtual com limite calculado pelo score | Implementado |
| RF27 | O sistema deve registrar cada evento relevante em uma cadeia de hashes (blockchain interno) | Implementado |
| RF28 | O sistema deve permitir depósito de saldo na carteira via Pix simulado | Implementado |
| RF29 | O sistema deve disponibilizar histórico de transações da carteira | Implementado |
| RF30 | O sistema deve permitir proposição e aceite de renegociação de prazo | Implementado |
| RF31 | O sistema deve impedir que o proponente de uma renegociação aceite sua própria proposta | Implementado |
| RF32 | O sistema deve disponibilizar tela de verificação de prova blockchain do acordo | Implementado |
| RF33 | O sistema deve mascarar o CPF do usuário em todas as respostas da API | Implementado |
| RF34 | O sistema deve disponibilizar notificações internas de eventos | Parcial |
| RF35 | O sistema deve disponibilizar painel de métricas para o administrador (dashboard) | Implementado |

---

## 33. Requisitos Não Funcionais

| Código | Requisito | Status |
|---|---|---|
| RNF01 | As senhas devem ser armazenadas com hash bcrypt (salt 10) | Implementado |
| RNF02 | Autenticação deve ser baseada em JWT com expiração configurável | Implementado |
| RNF03 | O CPF do usuário nunca deve ser retornado em texto completo pela API | Implementado |
| RNF04 | A API deve limitar requisições a 60 por minuto por IP (rate limiting) | Implementado |
| RNF05 | A API deve validar e rejeitar dados fora das especificações dos DTOs | Implementado |
| RNF06 | Todas as operações financeiras críticas devem ser executadas em transações atômicas | Implementado |
| RNF07 | A API deve disponibilizar documentação automática via Swagger/OpenAPI | Implementado |
| RNF08 | O sistema deve registrar eventos de auditoria em cadeia de hashes SHA256 | Implementado |
| RNF09 | O banco de dados deve ser acessível apenas pela API (sem exposição direta) | Implementado |
| RNF10 | CORS deve restringir origens permitidas | Implementado |
| RNF11 | Tokens JWT do admin e do usuário comum devem usar secrets diferentes | Implementado |
| RNF12 | O sistema deve ser executável em ambiente de desenvolvimento com Docker | Implementado |
| RNF13 | A interface mobile deve funcionar em iOS e Android (React Native multiplataforma) | Implementado |
| RNF14 | O token JWT deve ser armazenado de forma segura no dispositivo (SecureStore) | Implementado |
| RNF15 | O sistema deve retornar erros padronizados e legíveis | Implementado |
| RNF16 | O código deve ser escrito em TypeScript com tipagem estrita | Implementado |
| RNF17 | O monorepo deve ser gerenciável com pnpm workspaces | Implementado |
| RNF18 | O sistema deve ser escalável para múltiplos módulos independentes | Implementado (arquitetura modular NestJS) |
| RNF19 | Testes automatizados devem ser suportados pela estrutura do projeto | Parcial (estrutura Jest criada) |
| RNF20 | O upload de evidências deve suportar imagens e documentos | Implementado (multer) |

---

## 34. Regras de Negócio Numeradas

| Código | Regra de Negócio |
|---|---|
| RN01 | Somente usuários autenticados podem criar, visualizar ou interagir com acordos |
| RN02 | O pagador (criador do acordo) não pode ser o mesmo que o recebedor |
| RN03 | O recebedor é identificado pela SeloKey, nunca por CPF ou e-mail |
| RN04 | Todo usuário recebe uma SeloKey única e imutável no cadastro |
| RN05 | Um acordo recém-criado expira automaticamente se não for aceito em 1 hora |
| RN06 | Apenas o recebedor pode aceitar ou recusar um acordo em `PENDING_ACCEPTANCE` |
| RN07 | Após o aceite, o acordo com garantia exige depósito do pagador para ficar ativo |
| RN08 | O depósito via carteira exige que o pagador tenha `availableBalance >= amount` |
| RN09 | O depósito via Pix simulado não verifica saldo (assume pagamento externo) |
| RN10 | O depósito via cartão exige cartão ativo com `(creditLimit - usedLimit) >= amount` |
| RN11 | Após depósito, o valor fica em `blockedBalance` — não disponível para uso |
| RN12 | O acordo simples não movimenta nenhum saldo financeiro |
| RN13 | A liberação do valor exige confirmação OBRIGATÓRIA de ambas as partes |
| RN14 | O pagador confirma com `OBLIGATION_FULFILLED`; o recebedor com `READY_TO_RECEIVE` |
| RN15 | Somente após as duas confirmações o valor é transferido ao recebedor |
| RN16 | Uma disputa só pode ser aberta em acordo com status `ACTIVE` ou `IN_NEGOTIATION` |
| RN17 | Qualquer dos participantes pode abrir uma disputa |
| RN18 | Ao abrir uma disputa em acordo com garantia, o valor muda para `VALUE_LOCKED_BY_DISPUTE` |
| RN19 | Nenhuma parte pode mover ou confirmar sobre um valor travado em disputa |
| RN20 | Somente o administrador pode resolver disputas |
| RN21 | A decisão `KEEP_LOCKED` foi removida do sistema — toda disputa deve ter resolução concreta |
| RN22 | A decisão `RELEASE_TO_RECEIVER` libera o valor ao recebedor e conclui o acordo |
| RN23 | A decisão `REFUND_TO_PAYER` reembolsa o pagador e cancela o acordo |
| RN24 | A decisão `PROPOSE_RENEGOTIATION` cria uma negociação com +7 dias e coloca o acordo em IN_NEGOTIATION |
| RN25 | Disputas `RESOLVED` ou `CLOSED` não podem receber nova decisão |
| RN26 | O proponente de uma renegociação não pode aceitar ou recusar sua própria proposta |
| RN27 | Uma renegociação expira automaticamente em 48 horas sem resposta |
| RN28 | O score inicial de todo usuário é 100 pontos |
| RN29 | O score não pode ser negativo — limitado inferiormente a 0 |
| RN30 | O score determina o limite do cartão virtual SeloPay |
| RN31 | Score < 300 impede ativação do cartão virtual |
| RN32 | Cada usuário pode ter no máximo um cartão virtual SeloPay |
| RN33 | O cartão virtual não é emissão real — é um mecanismo interno de crédito por confiança |
| RN34 | O Pix implementado no SeloPay é 100% simulado — sem integração com o sistema Pix real |
| RN35 | Todo evento relevante gera um `BlockchainRecord` com hash SHA256 encadeado |
| RN36 | O blockchain interno não se conecta a redes públicas ou distribuídas |
| RN37 | O CPF do usuário é mascarado em todas as respostas da API |
| RN38 | A sessão de administrador é completamente separada da sessão de usuário comum |
| RN39 | Um acordo só pode ser visualizado pelos seus participantes (pagador ou recebedor) |
| RN40 | O admin pode visualizar todos os acordos, usuários e disputas do sistema |

---

## 35. Matriz de Cobertura do Projeto

| Tema | Onde foi encontrado | Status | Observações |
|---|---|---|---|
| **Acordo simples** | agreements.service.ts, agreements/[id].tsx | Parcial | AgreementType só tem GUARANTEED no schema. Acordos sem garantia funcionam via fluxo, não via tipo distinto |
| **Acordo com garantia** | agreements.service.ts, schema.prisma, mobile [id].tsx | Implementado | Três fontes de garantia: wallet, Pix, cartão |
| **Carteira** | wallet.service.ts, wallet.controller.ts, wallet.tsx, schema (Wallet, WalletTransaction) | Implementado | Saldo disponível e bloqueado, histórico de 100 transações |
| **Pix simulado** | wallet.service.ts, agreements.service.ts, deposit-pix.tsx, deposit.tsx | Implementado (simulado) | QR Code fake, copia-e-cola fake, sem Banco Central |
| **Dupla confirmação** | agreements.service.ts (confirm + AgreementConfirmation) | Implementado | Regra central do sistema |
| **Disputas** | disputes.service.ts, disputes.controller.ts, schema (Dispute, Evidence, History, Response) | Implementado | Com upload de evidências e resposta da contraparte |
| **Admin** | admin.service.ts, admin.controller.ts, (admin)/ telas, AdminUser | Implementado | Dashboard, usuários, acordos, disputas, decisões |
| **Score** | score.service.ts, ScoreEvent, score.tsx, ScoreGauge.tsx | Implementado | 8 tipos de evento, influencia limite do cartão |
| **Reputação** | ScoreEvent, score-events endpoint, score.tsx | Implementado | Histórico de eventos de comportamento |
| **Cartão virtual** | virtual-card.service.ts, virtual-card.controller.ts, VirtualCard, virtual-card.tsx | Implementado | Limite dinâmico por score, garantia via cartão |
| **Blockchain** | blockchain.service.ts, BlockchainRecord, blockchain-proof.tsx | Implementado (simulado) | SHA256 encadeado, sem rede pública |
| **Tokenização** | Não encontrado | Não encontrado | Fora do escopo do MVP |
| **Banco de dados** | schema.prisma, migrations/, prisma.service.ts | Implementado | 17+ entidades, relações complexas, migrations versionadas |
| **API** | controllers/ + services/ (8 módulos) | Implementado | 35+ endpoints documentados via Swagger |
| **Mobile** | apps/mobile/app/ | Implementado (em andamento) | 20+ telas, Expo Router, React Native |
| **Notificações** | NotificationsContext, notifications.tsx | Parcial | Contexto implementado, push real não integrado |
| **Segurança** | jwt, bcrypt, ThrottlerModule, CORS, mascaramento CPF | Implementado | Boas práticas de segurança para MVP |
| **Testes** | Jest configurado, ts-jest | Parcial | Estrutura criada, testes de integração não completados |
| **TCC** | Este dossiê | Documentado | Cobertura completa para base acadêmica |
| **Reset/Demo** | prisma/reset-demo.ts | Implementado | Script idempotente para reiniciar massa de dados |
| **Renegociação** | negotiations, agreements.service.ts, [id].tsx | Implementado | Proposta, aceite e recusa com regras de papel |
| **Blockchain eventos** | BlockchainEventType (16+ tipos) | Implementado | Cobre todo o ciclo de vida do acordo |
| **SeloKey** | auth.service.ts, User, profile.tsx | Implementado | Geração automática, imutável, copiável no app |

---

## 36. Arquivos Analisados

### Backend (apps/api)

```
apps/api/
├── prisma/
│   ├── schema.prisma                          # Schema completo — 17 models, 14 enums
│   ├── migrations/
│   │   ├── 20260607165844_init/               # Migration inicial
│   │   ├── 20260616042512_add_dispute_response/
│   │   ├── 20260616060641_pix_deposits/
│   │   ├── 20260617033329_blockchain_and_virtual_card/
│   │   └── 20260622000000_remove_keep_locked/
│   ├── seed.ts                                # Seed com admin e usuários demo
│   └── reset-demo.ts                          # Reset completo da massa de dev
├── src/
│   ├── main.ts                                # Bootstrap, prefixo, Swagger, CORS, ThrottlerModule
│   ├── app.module.ts                          # Módulos globais registrados
│   ├── common/
│   │   ├── constants/safe-user-select.ts
│   │   ├── decorators/current-user.decorator.ts
│   │   ├── filters/http-exception.filter.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── guards/admin-jwt.guard.ts
│   │   └── config/multer.config.ts
│   └── modules/
│       ├── auth/auth.{controller,service,module}.ts + dto/ + strategies/
│       ├── users/users.{controller,service,module}.ts
│       ├── wallet/wallet.{controller,service,module}.ts + dto/
│       ├── agreements/agreements.{controller,service,module}.ts + dto/
│       ├── disputes/disputes.{controller,service,module}.ts + dto/
│       ├── admin/admin.{controller,service,module}.ts + dto/ + strategies/
│       ├── score/score.{service,module}.ts
│       ├── blockchain/blockchain.{service,module}.ts
│       └── virtual-card/virtual-card.{controller,service,module}.ts
└── package.json
```

### Mobile (apps/mobile)

```
apps/mobile/
├── app/
│   ├── _layout.tsx                            # Root layout, providers
│   ├── index.tsx                              # Redirect inteligente
│   ├── (auth)/welcome.tsx, login.tsx, register.tsx
│   ├── (tabs)/_layout.tsx, home.tsx, wallet.tsx, agreements.tsx, profile.tsx
│   ├── (admin)/_layout.tsx, disputes.tsx, dispute/[id].tsx
│   ├── agreements/create.tsx, [id].tsx
│   ├── deposit.tsx, deposit-pix.tsx
│   ├── score.tsx, virtual-card.tsx
│   ├── blockchain-proof.tsx, notifications.tsx
│   └── (auth)/_layout.tsx
└── src/
    ├── contexts/AuthContext.tsx, AdminAuthContext.tsx, NotificationsContext.tsx
    ├── services/api.ts
    ├── types/index.ts
    ├── theme/index.ts
    ├── utils/formatters.ts
    └── components/ui/ (Button, Input, Card, LoadingScreen), FloatingTabBar, ScoreGauge, SeloPayLogo
```

### Raiz do monorepo

```
SeloPay/
├── pnpm-workspace.yaml
├── package.json
├── docker-compose.yml
└── .env
```

---

## 37. Conclusão

O SeloPay é uma plataforma de acordos digitais desenvolvida como MVP acadêmico para TCC de Ciência da Computação. O sistema resolve um problema real e cotidiano — a fragilidade e informalidade dos acordos entre pessoas — por meio de uma infraestrutura digital completa que cobre o ciclo de vida integral de um compromisso: criação, aceite, execução, confirmação, contestação e resolução.

**O que é o SeloPay**: Uma plataforma mobile que permite a duas pessoas registrar, acompanhar e garantir (de forma simulada) o cumprimento de acordos, com histórico rastreável, reputação baseada em comportamento e resolução estruturada de conflitos.

**Por que é relevante**: O problema abordado — acordos informais sem garantia, sem registro e sem mecanismo de resolução — é universal e afeta milhões de transações cotidianas. A solução proposta demonstra como a tecnologia pode elevar o nível de confiança em interações econômicas sem exigir contratos jurídicos formais.

**O que resolve**: Falta de registro, risco de inadimplência, conflitos sobre termos, ausência de histórico de comportamento e dificuldade de cobrança em acordos informais.

**Contribuição como TCC**: O projeto demonstra de forma integrada conceitos de engenharia de software (máquina de estados, transações atômicas, arquitetura modular), segurança (JWT duplo, bcrypt, rate limiting), banco de dados relacional com relacionamentos complexos (Prisma + PostgreSQL), desenvolvimento mobile (React Native + Expo Router) e arquitetura de confiança digital (escrow simulado, score de reputação, registro imutável de eventos).

**Pontos fortes**:
- Arquitetura limpa, modular e extensível
- Regras de negócio claras e implementadas (não apenas conceituais)
- Fluxos financeiros simulados com fidelidade arquitetural
- Blockchain interno para rastreabilidade
- Score de confiança com impacto real no sistema (limite de cartão)
- Interface mobile moderna e coerente com a identidade do produto

**Próximos passos naturais**:
1. Completar as telas mobile restantes
2. Adicionar testes automatizados
3. Integrar Pix real via sandbox do Banco Central
4. Publicar o Swagger e documentar os fluxos com diagramas UML
5. Realizar avaliação de usabilidade com usuários reais
6. Submeter para publicação acadêmica

O SeloPay está em estágio avançado de MVP com API 100% funcional e mobile em andamento, pronto para demonstração completa dos fluxos principais e com base técnica sólida para evolução rumo a um produto real.

---

*Dossiê gerado com base na análise direta do código-fonte do repositório SeloPay.*
*Nenhum arquivo do projeto foi alterado durante a geração deste documento.*
