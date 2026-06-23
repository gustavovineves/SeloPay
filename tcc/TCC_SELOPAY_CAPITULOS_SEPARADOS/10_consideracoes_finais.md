# CAPÍTULO 9 — CONSIDERAÇÕES FINAIS

## 9.1 Conclusão

Este trabalho apresentou o desenvolvimento do SeloPay, uma plataforma digital para registro, acompanhamento e garantia simulada de acordos entre usuários. O objetivo central do projeto — desenvolver um MVP funcional que demonstrasse a viabilidade técnica e conceitual de um sistema de confiança digital para acordos informais — foi alcançado.

O problema abordado — a fragilidade e informalidade dos acordos cotidianos entre pessoas físicas — é genuíno, relevante e amplamente presente na realidade social brasileira. A ausência de infraestrutura acessível para formalizar compromissos informais gera perdas econômicas, conflitos interpessoais e desconfiança acumulada que afeta especialmente trabalhadores autônomos, microempreendedores e pessoas em situação de vulnerabilidade econômica.

A solução desenvolvida demonstrou que é tecnicamente viável construir, com um conjunto moderno de tecnologias amplamente adotadas na indústria, uma plataforma que:

- Registra acordos digitalmente com identificação clara de partes, termos e prazos.
- Protege o valor combinado por meio de um mecanismo de garantia simulada (escrow digital).
- Exige consenso mútuo explícito para a liberação do valor protegido.
- Oferece um processo estruturado de contestação com evidências e resolução administrativa.
- Rastreia o comportamento dos usuários por meio de um sistema de reputação baseado em eventos.
- Registra cada evento relevante em uma cadeia de hashes para auditabilidade futura.

Do ponto de vista técnico, o SeloPay demonstrou a aplicação integrada de conceitos de engenharia de software, modelagem de dados, segurança da informação, arquitetura de sistemas e desenvolvimento mobile em um produto coeso e funcional. A API REST conta com mais de 35 endpoints documentados, o banco de dados define 17 entidades e 14 enumerações, e o aplicativo mobile oferece mais de 20 telas cobrindo os principais fluxos do sistema.

As limitações do MVP — especialmente a ausência de operação financeira real, integração com o Pix, testes automatizados e conformidade regulatória — são reconhecidas explicitamente e não invalidam a validade acadêmica do trabalho. Elas representam, ao contrário, o ponto de partida para trabalhos futuros que poderiam evoluir o SeloPay de protótipo acadêmico para produto com potencial de mercado.

---

## 9.2 Contribuições do Projeto

O SeloPay apresenta as seguintes contribuições para a área de Ciência da Computação e Sistemas de Informação:

**Contribuição técnica:** Demonstração de uma arquitetura modular completa para um sistema de confiança digital, integrando API REST, banco de dados relacional, aplicativo mobile multiplataforma, autenticação dupla com JWT e registro encadeado de eventos — todos implementados com tecnologias modernas e documentados de forma transparente.

**Contribuição conceitual:** A implementação do mecanismo de dupla confirmação como requisito obrigatório para liberação de valor representa uma formalização técnica de um conceito importante em sistemas de escrow digital — o princípio de que a liberação de valor deve exigir o reconhecimento ativo de ambas as partes, não apenas a declaração unilateral de cumprimento.

**Contribuição metodológica:** A documentação explícita das limitações do MVP — especialmente a clareza sobre o que é simulado, o que é real e o que é conceitual — oferece um modelo de honestidade acadêmica relevante para trabalhos de desenvolvimento de software em contexto universitário.

**Contribuição prática:** O código-fonte completo do SeloPay, organizado em monorepo com estrutura clara e documentação de API automática via Swagger, pode servir como base de referência para trabalhos futuros que busquem implementar sistemas similares de acordos digitais, escrow simulado ou reputação comportamental.

**Contribuição social:** A plataforma demonstra que é possível construir infraestrutura digital de confiança acessível por dispositivo móvel, sem necessidade de conhecimento jurídico ou acesso a serviços especializados, potencialmente democratizando o acesso a mecanismos de proteção em acordos informais.

---

## 9.3 Trabalhos Futuros

O desenvolvimento futuro do SeloPay pode ser organizado em três dimensões: técnica, de produto e regulatória.

### Trabalhos futuros de natureza técnica

**Integração com o Pix real:** A integração com o SPI por meio de uma instituição financeira ou Prestador de Serviço de Pagamento (PSP) habilitado pelo Banco Central seria o passo mais significativo para a viabilidade de um produto real. Isso exigiria registro em parceiro financeiro, implementação de webhook de confirmação de pagamento e tratamento de edge cases como pagamentos duplicados, timeouts e reembolsos via Pix.

**Testes automatizados:** Implementação de suíte completa de testes de unidade e de integração com Jest/ts-jest, cobrindo os serviços críticos (especialmente `AgreementsService` e `AdminService`) e os fluxos de ponta a ponta via Supertest para a API.

**Jobs agendados (cron):** Implementação de tarefas agendadas via `@nestjs/schedule` para: expiração automática de acordos em `PENDING_ACCEPTANCE` após 1 hora, expiração de negociações após 48 horas e expiração de depósitos Pix após 30 minutos.

**Notificações push reais:** Integração com Firebase Cloud Messaging (FCM) para Android e Apple Push Notification Service (APNs) para iOS, enviando notificações automáticas para os usuários quando o status de seus acordos mudar.

**Armazenamento em nuvem de evidências:** Substituição do armazenamento local de arquivos por um serviço como AWS S3, Cloudflare R2 ou Google Cloud Storage, com URLs assinadas para acesso seguro.

**CI/CD:** Implementação de pipeline de integração contínua via GitHub Actions ou similar, executando testes automatizados, typecheck e build a cada push ou pull request.

**Blockchain em testnet:** Para fins de demonstração mais próximos da realidade, os eventos do SeloPay poderiam ser enviados a uma blockchain pública de teste (como Ethereum Sepolia) em vez de apenas ao banco de dados interno, oferecendo rastreabilidade publicamente verificável.

### Trabalhos futuros de natureza de produto

**Tipo de acordo simples no schema:** Introdução de `AgreementType.SIMPLE` para distinguir formalmente acordos sem garantia financeira de acordos com garantia, permitindo relatórios mais claros e validações mais precisas.

**Score multifatorial:** Evolução do sistema de score para considerar fatores como valor dos acordos cumpridos (não apenas quantidade), frequência de uso da plataforma, tempo de conta e diversidade de relacionamentos — aproximando-o de modelos reais de credit scoring comportamental.

**Templates de acordos:** Criação de modelos pré-prontos para casos de uso comuns (empréstimo pessoal, pagamento de serviço, parcelamento informal, prestação de serviço freelance), reduzindo o atrito de criação e aumentando a clareza dos termos.

**Versão web:** Desenvolvimento de um portal web (Next.js ou similar) para que usuários possam gerenciar acordos também em desktop, além do aplicativo mobile.

**Análise antifraude:** Implementação de regras heurísticas ou modelos de machine learning para identificar padrões suspeitos — como usuários que abrem disputas sistematicamente após receberem o serviço — e alertar o administrador.

**Exportação de comprovante:** Geração de PDF com o histórico completo do acordo e seus eventos blockchain, para uso como evidência informal em situações extrajudiciais.

### Trabalhos futuros de natureza regulatória

**Conformidade com LGPD:** Implementação de endpoints para solicitação de exportação e exclusão de dados pessoais, conforme exigido pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

**KYC progressivo:** Implementação de verificação de identidade em etapas, com integração a serviços como Serasa, Receita Federal ou plataformas de biometria, aumentando a confiabilidade das identidades cadastradas e permitindo o aumento de limites de operação conforme o nível de verificação.

**Registro como instituição de pagamento:** Para operar com dinheiro real, o SeloPay precisaria de autorização do Banco Central como Instituição de Pagamento, conforme Lei nº 12.865/2013 e regulamentações do CMN/BCB. Essa é uma barreira regulatória significativa que define a distinção entre o MVP acadêmico e um produto comercialmente viável.

Em síntese, o SeloPay representa um ponto de partida técnica e conceitualmente sólido para uma plataforma de confiança digital. Os trabalhos futuros aqui descritos não são apenas melhorias incrementais, mas passos necessários para a evolução do sistema de protótipo acadêmico para produto com impacto social e econômico real.
