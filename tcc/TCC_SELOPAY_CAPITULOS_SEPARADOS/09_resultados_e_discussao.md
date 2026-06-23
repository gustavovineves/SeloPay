# CAPÍTULO 8 — RESULTADOS E DISCUSSÃO

## 8.1 Resultados Alcançados

O desenvolvimento do SeloPay como MVP resultou em um sistema funcional que atende aos objetivos específicos estabelecidos no início do projeto. A Tabela 8 apresenta o status de cada objetivo ao final do desenvolvimento.

**Tabela 8 — Status dos Objetivos Específicos**

| Código | Objetivo | Status | Observação |
|--------|----------|--------|------------|
| OE01 | Cadastro com SeloKey única | ✅ Implementado | Geração automática, único no sistema |
| OE02 | Autenticação segura com JWT | ✅ Implementado | Dois contextos separados (usuário/admin) |
| OE03 | Criação de acordos digitais | ✅ Implementado | Com validação de partes, prazo e valor |
| OE04 | Registro de termos do acordo | ✅ Implementado | Partes, valor, descrição, prazo |
| OE05 | Aceite e recusa pelo recebedor | ✅ Implementado | Com validação de papel |
| OE06 | Acompanhamento do ciclo de vida | ✅ Implementado | Máquina de estados com 9 estados |
| OE07 | Depósito simulado (3 fontes) | ✅ Implementado | Carteira, Pix, Cartão |
| OE08 | Bloqueio do valor simulado | ✅ Implementado | blockedBalance + VALUE_LOCKED_BY_DISPUTE |
| OE09 | Liberação por dupla confirmação | ✅ Implementado | Transação atômica com verificação de ambas |
| OE10 | Disputas com evidências | ✅ Implementado | Upload de arquivos, resposta da contraparte |
| OE11 | Painel admin para disputas | ✅ Implementado | Dashboard, listagem, decisão |
| OE12 | Blockchain interno (simulado) | ✅ Implementado | SHA256 encadeado, 16 tipos de evento |
| OE13 | Score comportamental | ✅ Implementado | 8 tipos de evento, histórico completo |
| OE14 | Cartão virtual com limite por score | ✅ Implementado | 4 faixas de limite, garantia via cartão |
| OE15 | Renegociação de acordos | ✅ Implementado | Proposta, aceite, recusa, expiração |
| OE16 | Carteira digital | ✅ Implementado | Saldo disponível/bloqueado, histórico |
| OE17 | Pix simulado (QR Code fake) | ✅ Implementado | Dois fluxos: carteira e garantia |
| OE18 | Notificações internas | ⚠️ Parcial | Contexto e tela criados; push não integrado |

O único objetivo que permanece parcialmente implementado é OE18 (notificações), onde a infraestrutura de consulta foi desenvolvida (contexto, tela, endpoint), mas o envio automático de notificações por evento e a integração com serviços de push notification (Firebase Cloud Messaging, APNs) não foram realizados no escopo do MVP.

### API REST completa

A API REST conta com mais de 35 endpoints distribuídos em 8 módulos independentes, todos documentados automaticamente via Swagger/OpenAPI. A verificação de tipo em tempo de compilação (`tsc --noEmit`) retornou 0 erros em ambos os projetos (API e mobile), demonstrando a consistência da tipagem ao longo de toda a base de código.

### Aplicativo mobile

O aplicativo mobile cobre os principais fluxos do sistema por meio de mais de 20 telas desenvolvidas com Expo Router e React Native. A interface segue um design system próprio com paleta de cores consistente, componentes reutilizáveis e identidade visual distinta.

### Banco de dados

O schema do banco de dados define 17 entidades, 14 enumerações e múltiplos relacionamentos complexos, com histórico de migrations versionadas e scripts de seed e reset para ambiente de demonstração.

---

## 8.2 Discussão

### Adequação técnica das escolhas

As escolhas tecnológicas demonstraram-se adequadas para o contexto do projeto. O **NestJS** facilitou a organização modular do backend: cada funcionalidade (autenticação, acordos, disputas, score, blockchain, cartão) é encapsulada em seu próprio módulo, com responsabilidades claras. A injeção de dependência nativa eliminou a necessidade de gerenciamento manual de instâncias e facilitou o reuso de serviços globais (`ScoreService`, `BlockchainService`) em múltiplos módulos.

O **Prisma** com PostgreSQL provou-se uma combinação eficaz para um domínio com modelo de dados complexo. A tipagem automática gerada a partir do schema eliminou uma classe inteira de erros comuns em ORMs não tipados, como referências a campos inexistentes ou tipos incorretos em queries. O suporte a transações atômicas do Prisma (`$transaction`) foi essencial para garantir a integridade das operações financeiras simuladas.

O **React Native com Expo** permitiu entregar uma interface mobile funcional em tempo de desenvolvimento compatível com o escopo de um TCC, sem a necessidade de desenvolver aplicativos nativos separados para iOS e Android. O Expo Router simplificou a definição de rotas e facilitou a implementação de layouts aninhados (tabs, auth, admin).

### Decisões de design relevantes

**Separação de contextos JWT:** A decisão de usar JWTs com segredos distintos para usuários e administradores foi fundamental para a segurança do sistema. Uma implementação alternativa — usar o mesmo JWT com campo de papel (`role`) — seria mais simples, mas criaria um risco: se o segredo JWT fosse comprometido, um atacante poderia potencialmente forjar um token de administrador. A separação garante que esse ataque exigiria comprometer o segredo específico de administrador.

**Transações atômicas para operações financeiras:** Todas as operações que modificam saldos ou estados de acordos foram implementadas dentro de transações Prisma (`$transaction`). Essa decisão garante que falhas parciais — como a criação do registro de transação sem a atualização do saldo — são impossíveis. Em um sistema com dinheiro real, essa garantia seria absolutamente obrigatória; no SeloPay simulado, ela demonstra uma prática importante de engenharia.

**Remoção do KEEP_LOCKED:** Durante o desenvolvimento, foi identificado que a opção `KEEP_LOCKED` (manter o valor bloqueado indefinidamente) representava um estado de impasse sem resolução — um acordo que nunca poderia ser concluído ou cancelado. A decisão de remover essa opção do fluxo de decisão administrativa reforçou o princípio de que toda contestação deve resultar em uma ação concreta: liberar ao recebedor, reembolsar ao pagador ou propor renegociação.

**Blockchain não bloqueante:** O `BlockchainService` é chamado de forma não bloqueante: os módulos chamadores registram o evento com `.catch(() => {})`, garantindo que uma falha no registro blockchain nunca interrompa a operação principal de negócio. Essa é uma decisão pragmática: o registro blockchain é importante para rastreabilidade, mas a operação financeira (liberação do valor, por exemplo) tem maior criticidade imediata.

### Limitações identificadas durante o desenvolvimento

**Expiração on-demand:** O mecanismo de expiração de acordos em `PENDING_ACCEPTANCE` é verificado sob demanda, quando o acordo é listado ou acessado — não há um processo de background (cron job) que expire acordos automaticamente. Isso significa que um acordo expirado pode aparecer como `PENDING_ACCEPTANCE` até que alguém o acesse. Em produção, um NestJS `@nestjs/schedule` com tarefa agendada resolveria esse problema.

**Tipo de acordo único:** O schema define apenas `AgreementType.GUARANTEED`. A ausência de um tipo `SIMPLE` limita a expressividade do modelo e pode gerar confusão ao analisar dados no banco: como distinguir acordos que nunca foram depositar (efetivamente simples) de acordos que deveriam ter tido garantia mas não a receberam? A distinção no schema seria mais limpa.

**Armazenamento local de evidências:** Os arquivos de evidências das disputas são armazenados no sistema de arquivos local do servidor. Em ambiente de múltiplos servidores ou com reinicializações frequentes, esses arquivos seriam perdidos. Um serviço de armazenamento em nuvem seria mandatório em produção.

---

## 8.3 Diferenciais do Projeto

O SeloPay apresenta um conjunto de características que o distinguem de soluções mais simples de registro de acordos:

**Dupla confirmação obrigatória:** A exigência de confirmação explícita de ambas as partes para a liberação do valor é o mecanismo central de proteção mútua. Diferentemente de um sistema onde o recebedor simplesmente declara que recebeu, o SeloPay exige que o pagador também reconheça o cumprimento. Isso protege o recebedor (o pagador não pode reter o valor declarando não ter recebido) e protege o pagador (o valor não é liberado até que ele confirme).

**Três fontes de garantia:** A possibilidade de depositar a garantia via carteira interna, Pix simulado ou cartão virtual demonstra uma arquitetura extensível que suporta múltiplas formas de pagamento. Do ponto de vista do recebedor, o mecanismo de proteção é o mesmo independentemente da fonte escolhida pelo pagador.

**Sistema de reputação integrado:** O score de confiança não é um recurso isolado — ele está diretamente vinculado ao limite do cartão virtual, criando um ciclo de incentivo: usuários que cumprem acordos aumentam seu score, o que aumenta seu limite de crédito, o que aumenta sua capacidade de participar de acordos com valores maiores.

**Resolução estruturada de conflitos:** O fluxo de disputas com upload de evidências, resposta da contraparte e decisão administrativa oferece um processo mais robusto do que uma simples marcação de conflito. O administrador tem acesso a todas as informações necessárias para tomar uma decisão informada.

**Registro blockchain como evidência:** A cadeia de hashes SHA256 cria um histórico de eventos que pode ser apresentado como evidência em disputas — não apenas o estado atual do acordo, mas o registro cronológico de cada ação realizada por cada parte.

---

## 8.4 Limitações do MVP

As limitações do SeloPay como MVP são reconhecidas e documentadas como parte da honestidade acadêmica do trabalho:

| Limitação | Descrição |
|-----------|-----------|
| Sem operação financeira real | Nenhum valor real é movimentado; todos os saldos são simulados |
| Pix 100% simulado | Sem integração com SPI do Banco Central; QR Codes e códigos são fictícios |
| Sem KYC real | CPF é coletado mas não validado junto à Receita Federal ou bureaus |
| Blockchain não distribuído | Cadeia de hashes em banco SQL, sem rede distribuída ou consenso |
| Sem smart contracts | Não há execução automática de cláusulas contratuais |
| Sem notificações push reais | Não há integração com FCM ou APNs |
| Armazenamento local de arquivos | Evidências salvas no disco do servidor, sem serviço de nuvem |
| Sem testes automatizados completos | Suite Jest configurada mas não implementada |
| Sem CI/CD | Sem pipeline de integração e entrega contínua |
| Score simplificado | Não considera valor dos acordos, frequência ou outros fatores reais de credit scoring |
| Cartão sem bandeira real | Sem integração com Visa, Mastercard ou processadoras |
| Admin único centralizado | Um único administrador global, sem controle de acesso granular |
| Expiração on-demand | Sem cron job para expiração automática de acordos |
| Sem conformidade regulatória | Ausência de controles de PLD/AML e requisitos de fintech regulada |

Todas essas limitações são inerentes ao contexto de MVP acadêmico e não invalidam os objetivos de demonstração técnica e prova de conceito do projeto.
