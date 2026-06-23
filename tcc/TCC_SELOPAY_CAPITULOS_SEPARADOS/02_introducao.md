# CAPÍTULO 1 — INTRODUÇÃO

## 1.1 Contextualização

Na vida cotidiana, pessoas estabelecem constantemente compromissos financeiros e de serviço entre si: empréstimos a amigos e familiares, combinados de pagamento por serviços prestados de forma autônoma, acordos de parcelamento informal, promessas de entrega de produto, aluguel entre conhecidos e inúmeras outras situações nas quais o compromisso existe, mas a formalização não ocorre. Segundo dados do Banco Central do Brasil, o Brasil registrou, em 2022, mais de 100 bilhões de chaves Pix ativas e uma média de 90 milhões de transações por dia (BCB, 2023), evidenciando uma sociedade altamente digitalizada em termos de movimentação financeira. Contudo, a informalidade que antecede ou acompanha esses pagamentos — o acordo em si — permanece essencialmente não estruturada.

A ausência de registro formal em acordos informais cria um ambiente de vulnerabilidade mútua. O pagador que antecipa o valor de um serviço não tem garantia de que o serviço será prestado. O prestador de serviço que entrega antes de receber o pagamento não tem como comprovar o que foi acordado. Em caso de disputa, a única evidência disponível é a memória das partes ou, quando muito, uma conversa de aplicativo de mensagens — registro informal, passível de exclusão e sem valor jurídico consolidado.

Plataformas digitais têm buscado mitigar esse problema em diferentes frentes. Marketplaces de serviços, aplicativos de pagamento, contratos digitais e plataformas de reputação representam iniciativas parciais. No entanto, nenhuma delas resolve integralmente o problema do acordo informal entre pessoas físicas sem vínculo comercial formal, especialmente quando o valor envolvido é pequeno, o relacionamento é pessoal e a contratação de serviços jurídicos seria desproporcionalmente custosa.

O presente trabalho propõe e descreve o desenvolvimento do SeloPay, uma plataforma digital voltada à formalização, acompanhamento e garantia simulada de acordos entre usuários. O sistema permite que duas pessoas registrem digitalmente um compromisso, acompanhem seu ciclo de vida por meio de uma aplicação mobile, e disponham de mecanismos de proteção como depósito simulado de garantia, confirmação mútua de cumprimento e resolução estruturada de disputas com análise administrativa.

O SeloPay foi concebido e desenvolvido como Produto Mínimo Viável (MVP) no contexto acadêmico de um Trabalho de Conclusão de Curso, utilizando tecnologias modernas de desenvolvimento de software: NestJS para a API REST, PostgreSQL como banco de dados relacional, Prisma como ORM, e Expo com React Native para o aplicativo mobile. Nenhuma operação financeira real é executada pelo sistema — todos os mecanismos de pagamento e garantia são simulados para fins de demonstração.

---

## 1.2 Problema de Pesquisa

A problemática que motiva este trabalho pode ser formulada da seguinte maneira:

> *Como um sistema digital pode auxiliar na formalização, acompanhamento e aumento da confiança em acordos informais entre usuários, utilizando mecanismos de registro estruturado, garantia simulada de valores, dupla confirmação de cumprimento, resolução de disputas e sistema de reputação baseado em comportamento?*

A resposta a essa pergunta exige o desenvolvimento de um sistema que vá além do simples registro: é necessário um ciclo de vida bem definido para o acordo, mecanismos que incentivem o cumprimento, formas de proteção para ambas as partes em caso de não cumprimento e um histórico rastreável que permita à plataforma calcular e exibir a reputação de cada usuário com base em suas ações passadas.

---

## 1.3 Objetivo Geral

Desenvolver um Produto Mínimo Viável de uma plataforma digital denominada SeloPay, destinada à criação, registro, acompanhamento e garantia simulada de acordos entre usuários, com suporte a ciclo de vida completo do acordo, disputa estruturada e sistema de reputação comportamental.

---

## 1.4 Objetivos Específicos

Para alcançar o objetivo geral, foram estabelecidos os seguintes objetivos específicos:

a) Identificar e documentar os principais problemas e necessidades dos usuários que realizam acordos informais cotidianos;

b) Levantar e especificar os requisitos funcionais e não funcionais do sistema SeloPay;

c) Modelar as entidades de dados, os estados do sistema e os fluxos de negócio necessários à plataforma;

d) Desenvolver uma API REST modular com NestJS e TypeScript, suportada por banco de dados PostgreSQL e ORM Prisma;

e) Implementar o ciclo de vida completo de acordos digitais, incluindo criação, aceite, recusa, expiração, confirmação e cancelamento;

f) Implementar mecanismo de garantia simulada de valores com suporte a três fontes: carteira interna, Pix simulado e cartão virtual;

g) Implementar o mecanismo de dupla confirmação, pelo qual o valor protegido é liberado somente após o reconhecimento mútuo de cumprimento;

h) Implementar sistema de contestação de acordos com envio de evidências e resolução manual por administrador;

i) Implementar sistema de score de reputação baseado em eventos comportamentais do usuário;

j) Implementar cartão virtual com limite de crédito calculado dinamicamente com base no score do usuário;

k) Desenvolver aplicativo mobile multiplataforma com Expo e React Native, cobrindo os principais fluxos do sistema;

l) Documentar as limitações do MVP e propor melhorias para trabalhos futuros.

---

## 1.5 Justificativa

A relevância deste trabalho pode ser analisada sob três perspectivas: social, tecnológica e acadêmica.

**Perspectiva social:** O problema dos acordos informais não cumpridos afeta diretamente a qualidade das relações pessoais e econômicas de grande parte da população brasileira. A facilidade de combinar valores e serviços por aplicativos de mensagem não é acompanhada por uma infraestrutura de acompanhamento, prova ou resolução. A ausência de formalização contribui para ciclos de desconfiança que afetam, especialmente, trabalhadores autônomos, microempreendedores e pessoas em situação de vulnerabilidade econômica, que raramente têm acesso a mecanismos jurídicos formais de cobrança.

**Perspectiva tecnológica:** O desenvolvimento do SeloPay demonstra a aplicação prática de um conjunto expressivo de conceitos e tecnologias relevantes na indústria de software contemporânea: arquitetura modular com NestJS e injeção de dependência; modelagem de dados complexa com Prisma e PostgreSQL; gerenciamento de estados de ciclo de vida por máquina de estados; autenticação stateless com JWT em dois contextos separados; desenvolvimento mobile multiplataforma com React Native; e conceito de rastreabilidade encadeada de eventos inspirado em blockchain. O projeto evidencia como essas tecnologias podem ser integradas em um produto funcional e coeso.

**Perspectiva acadêmica:** O TCC propõe uma solução original para um problema real e cotidiano, permitindo a aplicação integrada de conhecimentos de engenharia de software, banco de dados, segurança da informação, usabilidade e arquitetura de sistemas. A proposta dialoga com temas emergentes como confiança digital, economia da reputação, fintech e legaltech, oferecendo uma base para investigação e extensão em trabalhos futuros.

---

## 1.6 Delimitação do Projeto

Este trabalho delimita-se ao desenvolvimento de um MVP acadêmico, com as seguintes restrições explícitas:

- **Sem operação financeira real:** Nenhum valor monetário real é movimentado, depositado ou custodiado pelo sistema. Todas as operações de saldo, bloqueio e liberação são simulações internas ao banco de dados.

- **Sem integração com o Pix real:** O sistema implementa uma simulação do fluxo Pix para fins de demonstração, gerando QR Codes e códigos copia-e-cola falsos. Não há integração com o Sistema de Pagamentos Instantâneos (SPI) do Banco Central do Brasil, nem com qualquer Prestador de Serviços de Pagamento (PSP).

- **Sem verificação real de identidade (KYC):** O campo CPF é coletado apenas como dado cadastral. Não há validação junto à Receita Federal, bureaus de crédito ou qualquer serviço de biometria.

- **Sem blockchain público:** O registro encadeado de eventos implementado no SeloPay utiliza hashes SHA256 em banco de dados relacional. Não há integração com redes distribuídas como Ethereum, Bitcoin, Hyperledger ou similares.

- **Sem cartão de crédito real:** O cartão virtual SeloPay é um mecanismo interno de limite de crédito baseado em score. Não há emissão real de cartão, integração com bandeiras (Visa, Mastercard) ou processadoras de pagamento.

- **Escopo mobile:** O aplicativo mobile cobre os principais fluxos do sistema. Funcionalidades secundárias podem estar parcialmente implementadas no estado atual do MVP.

- **Ambiente de desenvolvimento:** O sistema é executado em ambiente local com Docker para o banco de dados. Não há ambiente de produção configurado.

---

## 1.7 Organização do Trabalho

O presente trabalho está organizado em nove capítulos, além dos elementos pré-textuais e pós-textuais:

- **Capítulo 1 — Introdução:** Contextualiza o problema, apresenta os objetivos, justificativa e delimitação do projeto.

- **Capítulo 2 — Fundamentação Teórica:** Apresenta os conceitos e trabalhos relacionados que embasam o desenvolvimento do SeloPay, abordando transformação digital, confiança, escrow, reputação, blockchain e MVP.

- **Capítulo 3 — Metodologia:** Descreve o tipo de pesquisa adotado, os procedimentos metodológicos, as tecnologias utilizadas, o ambiente de desenvolvimento e os critérios de validação.

- **Capítulo 4 — Análise e Especificação do Sistema:** Apresenta a visão geral do SeloPay, os atores do sistema, os requisitos funcionais e não funcionais, as regras de negócio, os casos de uso e os fluxos principais.

- **Capítulo 5 — Projeto e Arquitetura da Solução:** Descreve a arquitetura geral, a estrutura do monorepo, o backend, o aplicativo mobile, o painel administrativo, o banco de dados, os endpoints da API, a segurança e a rastreabilidade de eventos.

- **Capítulo 6 — Desenvolvimento do MVP:** Detalha a implementação de cada funcionalidade principal do sistema, com descrição técnica de decisões tomadas.

- **Capítulo 7 — Testes e Validação:** Apresenta a estratégia de testes adotada, os cenários testados e os resultados observados.

- **Capítulo 8 — Resultados e Discussão:** Analisa os resultados obtidos, discute os diferenciais do projeto e as limitações identificadas.

- **Capítulo 9 — Considerações Finais:** Apresenta as conclusões do trabalho, as contribuições e as propostas de trabalhos futuros.

Ao final, encontram-se as referências bibliográficas e os apêndices com material complementar.
