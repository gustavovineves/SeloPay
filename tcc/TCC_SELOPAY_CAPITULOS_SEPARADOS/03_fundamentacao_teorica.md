# CAPÍTULO 2 — FUNDAMENTAÇÃO TEÓRICA

## 2.1 Transformação Digital e Formalização de Processos

A transformação digital pode ser compreendida como o processo pelo qual organizações e indivíduos utilizam tecnologias digitais para modificar e melhorar atividades, processos e modelos de interação previamente analógicos ou informais (WESTERMAN; BONNET; McAFEE, 2014 [REFERÊNCIA A CONFIRMAR]). Na perspectiva de sistemas de informação, esse processo envolve não apenas a automação de tarefas, mas a reconfiguração de fluxos de informação, papéis e responsabilidades.

No contexto de acordos interpessoais, a transformação digital representa a possibilidade de substituir ou complementar combinados verbais e registros em papel por documentos digitais estruturados, com data, partes identificadas, termos definidos e histórico rastreável. Essa transição não elimina a necessidade de confiança entre as partes, mas introduz mecanismos técnicos capazes de reduzir a dependência exclusiva de confiança interpessoal, substituindo-a parcialmente por confiança em sistemas (LUHMANN, 2000 [REFERÊNCIA A CONFIRMAR]).

A formalização digital de processos tem sido estudada especialmente no contexto de contratos inteligentes (*smart contracts*) e assinaturas digitais, mas também se aplica a contextos mais simples, como o registro e o acompanhamento de compromissos informais entre pessoas. Nesse espectro mais acessível, o objetivo não é a execução automática de cláusulas contratuais, mas a criação de um registro verificável que possa ser consultado, compartilhado e utilizado como evidência em caso de disputa.

---

## 2.2 Confiança Digital em Plataformas

A confiança é um elemento central nas trocas econômicas. Segundo Mayer, Davis e Schoorman (1995 [REFERÊNCIA A CONFIRMAR]), a confiança pode ser definida como a disposição de uma parte em ser vulnerável às ações de outra, baseada na expectativa de que a outra parte realizará uma ação específica importante para quem confia, independentemente da capacidade de monitorar ou controlar essa outra parte.

Em plataformas digitais, a confiança não pode ser fundamentada apenas no relacionamento interpessoal prévio. Pesquisas na área de comércio eletrônico demonstram que mecanismos institucionais de garantia — como sistemas de reputação, avaliações de outros usuários, mecanismos de escrow e suporte de resolução de disputas — desempenham papel fundamental na construção de confiança entre estranhos (GEFEN; STRAUB, 2004 [REFERÊNCIA A CONFIRMAR]).

Platforms como eBay, Airbnb, Uber e mercados online em geral validaram empiricamente que mecanismos de reputação e mediação de conflitos são determinantes para a adoção de plataformas de troca entre pessoas que não se conhecem previamente (RESNICK et al., 2000 [REFERÊNCIA A CONFIRMAR]). O SeloPay se posiciona nessa tradição ao incorporar um sistema de score comportamental e um painel administrativo de resolução de disputas.

Dini e Lazoi (2009 [REFERÊNCIA A CONFIRMAR]) apontam que sistemas de informação voltados à colaboração entre indivíduos precisam de mecanismos explícitos de responsabilização (*accountability*) para que a confiança possa ser sustentada ao longo do tempo. O histórico rastreável de eventos no SeloPay — materializado no blockchain interno simulado e no histórico de score — atende a essa necessidade de responsabilização.

---

## 2.3 Plataformas de Intermediação e Acordos Digitais

Parker, Van Alstyne e Choudary (2016 [REFERÊNCIA A CONFIRMAR]) definem plataformas digitais como sistemas que facilitam interações e trocas entre grupos de usuários, criando valor por meio da orquestração dessas trocas. No contexto do SeloPay, a plataforma funciona como intermediária de confiança entre pagador e recebedor, sem necessariamente ocupar a posição de parte em qualquer contrato jurídico.

Acordos digitais — também denominados contratos digitais ou contratos eletrônicos — são documentos formalizados em suporte eletrônico que registram obrigações, prazos, partes e condições de cumprimento. No Brasil, a validade jurídica de documentos eletrônicos é estabelecida pela Medida Provisória nº 2.200-2/2001, que institui a Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil), embora formas alternativas de autenticação também sejam reconhecidas em certos contextos.

O SeloPay não pretende substituir contratos juridicamente vinculantes. Seu objetivo é oferecer um registro digital informal que serve como evidência organizada do acordo, facilitando a resolução de conflitos por meio de um processo estruturado interno à plataforma. Essa abordagem é similar à de sistemas como o PayPal Disputes Center, o Airbnb Resolution Center e o Mercado Pago, que também operam resolução de conflitos internamente, sem vínculo direto com o sistema judiciário.

---

## 2.4 Sistemas de Pagamento, Escrow e Garantia

Mecanismos de escrow (depósito em garantia) são amplamente utilizados em transações onde há assimetria de informação ou risco de não cumprimento por uma das partes. Em sua forma tradicional, o escrow envolve uma terceira parte neutra que retém o valor até que as condições pré-acordadas sejam verificadas e cumpridas (WILLIAMSON, 1985 [REFERÊNCIA A CONFIRMAR]).

No contexto digital, plataformas como eBay Motors, Escrow.com e serviços similares oferecem escrow digital para transações de alto valor entre pessoas físicas. A popularização de contratos inteligentes em plataformas blockchain, como Ethereum, tornou possível a implementação de escrow sem intermediário humano, com liberação automática de valores condicionada ao cumprimento de parâmetros verificáveis on-chain (SZABO, 1997 [REFERÊNCIA A CONFIRMAR]).

O SeloPay implementa um conceito análogo ao escrow, porém inteiramente simulado: o valor não é real, mas o mecanismo de retenção, verificação e liberação espelha a lógica de um escrow digital. O pagador deposita um valor simulado que fica indisponível para uso até que ambas as partes confirmem o cumprimento ou um administrador tome uma decisão em caso de disputa. Essa simulação permite demonstrar o funcionamento do conceito sem a complexidade regulatória e operacional de um escrow financeiro real.

O sistema Pix, lançado pelo Banco Central do Brasil em novembro de 2020, é o sistema de pagamentos instantâneos mais adotado no país, permitindo transferências 24 horas por dia, 7 dias por semana, em poucos segundos (BCB, 2020 [REFERÊNCIA A CONFIRMAR]). O SeloPay simula o fluxo de pagamento via Pix — geração de QR Code e código copia-e-cola — sem qualquer integração real com o SPI ou com PSPs habilitados pelo Banco Central.

---

## 2.5 Reputação e Score em Sistemas Digitais

Sistemas de reputação têm sido amplamente estudados no contexto de plataformas de comércio eletrônico e de serviços. Resnick e Varian (1997 [REFERÊNCIA A CONFIRMAR]) foram pioneiros ao descrever sistemas de feedback como mecanismos que permitem a construção de reputação em ambientes onde as partes não se conhecem previamente, incentivando o comportamento honesto por meio de consequências futuras visíveis.

Dellarocas (2003 [REFERÊNCIA A CONFIRMAR]) aprofundou esse estudo, demonstrando que sistemas de reputação online são eficazes em reduzir o comportamento oportunista, ainda que sujeitos a manipulações e vieses. O autor ressalta que a qualidade do sistema de reputação depende da capacidade de vincular o histórico de comportamento ao perfil do usuário de forma confiável e de difícil adulteração.

No contexto de crédito, a ideia de atribuir uma pontuação numérica ao comportamento financeiro de um indivíduo é central ao conceito de *credit score*, popularizado pelo modelo FICO (RUBIN; SHERLIN, 2008 [REFERÊNCIA A CONFIRMAR]) e implementado no Brasil por meio de sistemas como o Serasa Score e o Cadastro Positivo. O SeloPay incorpora uma versão simplificada e comportamental desse conceito, calculando um score com base nas ações do usuário dentro da própria plataforma — acordos cumpridos, disputas ganhas ou perdidas, renegociações aceitas.

A distinção fundamental entre o score do SeloPay e sistemas de crédito reais é que aquele é completamente circunscrito ao ecossistema da plataforma, não utiliza dados externos e não tem valor financeiro ou legal fora do sistema. Sua função é incentivar o cumprimento de acordos e determinar o limite do cartão virtual interno.

---

## 2.6 Blockchain e Rastreabilidade de Eventos

O conceito de blockchain foi introduzido por Nakamoto (2008 [REFERÊNCIA A CONFIRMAR]) no artigo que descreve o Bitcoin como sistema de pagamentos eletrônicos ponto a ponto. A inovação central do blockchain é a criação de um registro distribuído, imutável e verificável de transações, baseado em encadeamento criptográfico de blocos de dados — onde cada bloco contém o hash do bloco anterior, tornando qualquer alteração retroativa detectável.

Além de aplicações em criptomoedas, o blockchain tem sido aplicado a contextos de rastreabilidade de cadeia de suprimentos (NAKASUMI, 2017 [REFERÊNCIA A CONFIRMAR]), registro de documentos, sistemas de saúde, votação eletrônica e contratos inteligentes. A característica central relevante para essas aplicações é a imutabilidade do registro: uma vez inscrito na cadeia, um evento não pode ser apagado sem que a invalidação seja detectável.

O SeloPay implementa um mecanismo inspirado nesse conceito, mas centralizado: um registro em banco de dados PostgreSQL onde cada evento gera um hash SHA256 calculado a partir do hash do evento anterior concatenado com o tipo e o payload do evento atual. Esse mecanismo não é distribuído, não é público e não garante a mesma robustez de um blockchain real, mas demonstra o conceito de rastreabilidade encadeada e auditável em um contexto acadêmico. A tela de "prova blockchain" no aplicativo mobile permite ao usuário visualizar a cadeia completa de eventos de um acordo com os respectivos hashes.

Swanson (2015 [REFERÊNCIA A CONFIRMAR]) distingue entre blockchain público (sem permissão, como Bitcoin e Ethereum) e blockchain privado/permissionado (como Hyperledger Fabric), sendo que este último se assemelha mais ao modelo do SeloPay em termos de governança centralizada, embora o SeloPay seja ainda mais simples por não envolver múltiplos nós.

---

## 2.7 Produto Mínimo Viável

O conceito de Produto Mínimo Viável (MVP — *Minimum Viable Product*) foi popularizado por Ries (2011 [REFERÊNCIA A CONFIRMAR]) no contexto da metodologia Lean Startup. Um MVP é definido como a versão de um produto com o mínimo de funcionalidades suficientes para ser entregue a usuários iniciais e possibilitar o aprendizado validado sobre o mercado e as necessidades dos usuários.

No contexto acadêmico, o MVP assume uma conotação ligeiramente diferente: trata-se de um protótipo funcional que implementa os casos de uso mais representativos do sistema proposto, com profundidade técnica suficiente para demonstrar a viabilidade da arquitetura e dos mecanismos propostos, sem necessariamente atender aos requisitos de escalabilidade, robustez e conformidade regulatória de um produto em produção.

Beck et al. (2001 [REFERÊNCIA A CONFIRMAR]), no Manifesto Ágil, propõem como princípio fundamental que "software funcionando é a medida primária de progresso". Essa perspectiva reforça o valor do MVP como entrega: ao final do desenvolvimento, o SeloPay deve ser capaz de executar os fluxos completos de criação de acordo, depósito de garantia, confirmação e resolução de disputa de forma funcional e demonstrável.

Sommerville (2011 [REFERÊNCIA A CONFIRMAR]) contextualiza o desenvolvimento de protótipos como etapa essencial no processo de engenharia de requisitos, especialmente em sistemas com alto grau de interação com usuários finais. O MVP do SeloPay cumpre essa função ao materializar os requisitos levantados em uma aplicação executável e testável, permitindo a avaliação prática das decisões de design e arquitetura.
