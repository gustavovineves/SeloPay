# CAPÍTULO 7 — TESTES E VALIDAÇÃO

## 7.1 Estratégia de Testes

A estratégia de testes adotada no desenvolvimento do MVP do SeloPay foi predominantemente baseada em **testes manuais e exploratórios**, complementados por **verificação de tipo estático** via compilador TypeScript e validação de consistência do banco de dados.

O projeto conta com a estrutura do framework Jest configurada, com suporte a TypeScript via `ts-jest`, mas os testes automatizados de integração e unidade não foram completados no escopo do MVP. Essa limitação está em linha com o contexto de desenvolvimento iterativo e focado em validação de produto adotado na fase inicial.

A validação foi conduzida por três frentes complementares:

**1. Swagger UI:** A documentação interativa da API, disponível em `http://localhost:3333/docs`, foi utilizada como principal ferramenta de teste dos endpoints. O Swagger UI permite autenticar com token JWT, enviar requisições com os payloads corretos e verificar as respostas e códigos HTTP retornados pelo servidor.

**2. Aplicativo mobile:** Os fluxos de usuário foram testados diretamente no aplicativo mobile em ambiente de desenvolvimento, verificando a consistência entre a interface apresentada e os dados persistidos no banco de dados.

**3. Verificação direta no banco:** Operações críticas — especialmente as que envolvem movimentação de saldo — foram verificadas diretamente no banco de dados PostgreSQL após execução, confirmando que as transações atômicas produziram os estados esperados em `availableBalance`, `blockedBalance` e registros de transação.

**4. TypeScript typecheck:** Os projetos `api` e `mobile` foram submetidos ao compilador TypeScript (`tsc --noEmit`) verificando ausência de erros de tipo, validando a consistência entre tipos definidos no schema Prisma, DTOs, interfaces TypeScript e componentes React Native.

---

## 7.2 Cenários Testados

A Tabela 7 apresenta os cenários de teste executados manualmente, com os resultados observados.

**Tabela 7 — Cenários de Teste e Validação**

| # | Cenário | Entrada | Resultado Esperado | Resultado Observado | Status |
|---|---------|---------|-------------------|---------------------|--------|
| T01 | Cadastro de novo usuário | Nome, CPF, e-mail, senha válidos | Usuário criado com SeloKey única, carteira zerada, JWT retornado | Conforme esperado | ✅ |
| T02 | Cadastro com e-mail duplicado | E-mail já cadastrado | Erro 409 Conflict | Erro retornado corretamente | ✅ |
| T03 | Cadastro com CPF duplicado | CPF já cadastrado | Erro 409 Conflict | Erro retornado corretamente | ✅ |
| T04 | Login com credenciais válidas | E-mail e senha corretos | JWT retornado, dados do usuário | Conforme esperado | ✅ |
| T05 | Login com senha incorreta | Senha errada | Erro 401 Unauthorized | Erro genérico retornado (sem indicar qual campo está errado) | ✅ |
| T06 | Acesso sem token JWT | Endpoint protegido sem header Authorization | Erro 401 Unauthorized | Conforme esperado | ✅ |
| T07 | Busca por SeloKey válida | SeloKey existente | Dados públicos do usuário | Retornou nome, SeloKey e id | ✅ |
| T08 | Busca por SeloKey inválida | SeloKey inexistente | Erro 404 Not Found | Conforme esperado | ✅ |
| T09 | Criação de acordo | SeloKey válida do recebedor, valor, descrição, data futura | Acordo em PENDING_ACCEPTANCE, expiresAt = +1h | Conforme esperado, blockchain registrado | ✅ |
| T10 | Criação de acordo consigo mesmo | Própria SeloKey como recebedor | Erro 400 Bad Request | Conforme esperado | ✅ |
| T11 | Criação de acordo com data passada | dueDate no passado | Erro 400 com mensagem | Conforme esperado | ✅ |
| T12 | Aceite do acordo pelo recebedor | Recebedor autentica e aceita | Acordo em WAITING_DEPOSIT, SimulatedPayment criado | Conforme esperado | ✅ |
| T13 | Aceite por usuário que não é o recebedor | Terceiro tenta aceitar | Erro 403 Forbidden | Conforme esperado | ✅ |
| T14 | Recusa do acordo pelo recebedor | Recebedor recusa | Acordo em REJECTED | Conforme esperado | ✅ |
| T15 | Depósito de garantia via carteira (saldo suficiente) | availableBalance >= amount | Acordo ACTIVE, blockedBalance incrementado, availableBalance decrementado | Saldos conferidos no banco — conforme esperado | ✅ |
| T16 | Depósito de garantia via carteira (saldo insuficiente) | availableBalance < amount | Erro 400 com saldo insuficiente | Conforme esperado | ✅ |
| T17 | Depósito via Pix simulado | Geração do QR Code fake | SimulatedPayment com fakePixCode e fakeQrCode | Conforme esperado | ✅ |
| T18 | Confirmação de Pix simulado (demo) | Endpoint de confirmação manual | Acordo passa para ACTIVE, blockedBalance incrementado | Conforme esperado | ✅ |
| T19 | Confirmação pelo pagador | OBLIGATION_FULFILLED | AgreementConfirmation criado, acordo permanece ACTIVE | Confirmação registrada, acordo aguarda recebedor | ✅ |
| T20 | Confirmação pelo recebedor após pagador | READY_TO_RECEIVE (segunda confirmação) | Valor liberado automaticamente, acordo COMPLETED, VALUE_RELEASED | Saldos conferidos: blockedBalance decrementou, receiverWallet incrementou | ✅ |
| T21 | Confirmação dupla — score atualizado | Após COMPLETED | Ambos com +5 no score | Verificado em GET /users/me | ✅ |
| T22 | Abertura de contestação em acordo ACTIVE | Título e descrição | Disputa OPEN, acordo IN_DISPUTE, VALUE_LOCKED_BY_DISPUTE | Conforme esperado, blockchain registrado | ✅ |
| T23 | Tentativa de contestar acordo não participado | Usuário não é parte do acordo | Erro 403 Forbidden | Conforme esperado | ✅ |
| T24 | Resposta à contestação pela parte contestada | Mensagem de resposta | DisputeResponse criado, visível no detalhe da disputa | Conforme esperado | ✅ |
| T25 | Upload de evidência | Arquivo de imagem ou PDF | DisputeEvidence criado, arquivo salvo em /uploads | Conforme esperado | ✅ |
| T26 | Resolução admin — RELEASE_TO_RECEIVER | Admin registra decisão | Disputa RESOLVED, acordo COMPLETED, receiver recebe saldo | Saldos conferidos no banco | ✅ |
| T27 | Resolução admin — REFUND_TO_PAYER | Admin registra reembolso | Disputa RESOLVED, acordo CANCELLED, payer recebe saldo de volta | Saldos conferidos no banco | ✅ |
| T28 | Resolução admin — PROPOSE_RENEGOTIATION | Admin propõe renegociação | Negotiation criada, acordo IN_NEGOTIATION | Conforme esperado | ✅ |
| T29 | Decisão em disputa já resolvida | Admin tenta decidir disputa RESOLVED | Erro 400 | Conforme esperado | ✅ |
| T30 | Consulta da carteira | GET /wallet | availableBalance, blockedBalance, transações | Conforme esperado com totais corretos | ✅ |
| T31 | Adição de saldo via simulate-credit | Valor positivo | availableBalance incrementado | Conforme esperado | ✅ |
| T32 | Ativação do cartão virtual (score >= 300) | Score 100 (inicial < 300) após ajuste para ≥ 300 | Cartão ativo com limite calculado | Score precisou ser ajustado via seed antes de ativar | ✅ |
| T33 | Ativação do cartão com score < 300 | Score inicial 100 | Erro ou limite zero | Erro retornado com explicação | ✅ |
| T34 | Depósito de garantia via cartão | Cartão ativo, limite suficiente | usedLimit incrementado, acordo ACTIVE | Conforme esperado, sem alterar carteira | ✅ |
| T35 | Proposta de renegociação | Nova data futura | Negotiation PENDING, acordo IN_NEGOTIATION | Conforme esperado | ✅ |
| T36 | Aceite de renegociação pela outra parte | Outra parte aceita | Negotiation ACCEPTED, acordo ACTIVE com nova dueDate | Conforme esperado | ✅ |
| T37 | Proponente tentando aceitar própria renegociação | Mesmo usuário que propôs | Erro 400 | Conforme esperado | ✅ |
| T38 | Verificação da cadeia blockchain | GET /api/admin/disputes/:id | BlockchainRecords com hashes encadeados | Cadeia verificada manualmente por hashes SHA256 | ✅ |
| T39 | Typecheck da API | tsc --noEmit (apps/api) | 0 erros | 0 erros | ✅ |
| T40 | Typecheck do Mobile | tsc --noEmit (apps/mobile) | 0 erros | 0 erros | ✅ |

---

## 7.3 Limitações dos Testes

O conjunto de testes aplicado ao MVP do SeloPay apresenta as seguintes limitações reconhecidas:

**Ausência de testes automatizados:** A estrutura Jest está configurada no projeto mas não foram escritos testes de unidade ou de integração automatizados. Isso significa que regressões introduzidas por futuras alterações no código não serão detectadas automaticamente.

**Ausência de testes de carga:** Não foram realizados testes de desempenho ou carga para avaliar o comportamento do sistema sob concorrência elevada. Operações como confirmação dupla simultânea por ambas as partes poderiam, em teoria, gerar condições de corrida se não tratadas adequadamente. A mitigação no código atual é o uso de transações atômicas no Prisma, mas não foi simulado um cenário de alta concorrência.

**Ausência de testes de segurança:** Não foram realizados testes de penetração ou avaliações formais de segurança. A validação de segurança foi limitada a verificações manuais dos cenários mais comuns de acesso não autorizado.

**Cobertura parcial das telas mobile:** As telas do aplicativo mobile foram testadas manualmente para os fluxos principais. Telas em desenvolvimento parcial — como notificações — não foram cobertas pelos testes.

**Dependência de ambiente de desenvolvimento:** Todos os testes foram realizados em ambiente de desenvolvimento local. Não há garantia de que o sistema se comportaria da mesma forma em ambiente de produção com configurações de rede, segurança e escala diferentes.

**Sem testes de regressão:** A ausência de uma suíte de testes automatizados significa que a validade dos resultados observados na Tabela 7 é válida para o estado do código no momento da escrita deste trabalho, mas não pode ser garantida após modificações futuras.

Essas limitações reforçam o caráter de MVP acadêmico do SeloPay e apontam para áreas de melhoria relevantes em trabalhos futuros.
