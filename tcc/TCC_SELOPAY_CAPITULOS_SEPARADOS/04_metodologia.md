# CAPÍTULO 3 — METODOLOGIA

## 3.1 Tipo de Pesquisa

Este trabalho se enquadra como pesquisa aplicada, de natureza exploratória e abordagem qualitativa, orientada pelo desenvolvimento de artefato tecnológico. Segundo Gil (2008 [REFERÊNCIA A CONFIRMAR]), a pesquisa aplicada tem como objetivo produzir conhecimento para aplicação prática, dirigida à solução de problemas específicos. A pesquisa exploratória, por sua vez, é indicada quando o objetivo é desenvolver, esclarecer e modificar conceitos e ideias em torno de um problema ainda pouco sistematizado.

O método de pesquisa adotado é o Design Science Research (DSR), proposto por Hevner et al. (2004 [REFERÊNCIA A CONFIRMAR]), que orienta a pesquisa em sistemas de informação como um processo de criação e avaliação de artefatos — algoritmos, modelos, métodos ou sistemas — que solucionam problemas organizacionais ou sociais identificados. Nessa perspectiva, o SeloPay é o artefato principal produzido por este trabalho, e sua avaliação se dá pela capacidade de resolver o problema de formalização e acompanhamento de acordos informais.

---

## 3.2 Procedimentos Metodológicos

O desenvolvimento do SeloPay seguiu as seguintes etapas metodológicas:

**Etapa 1 — Identificação e análise do problema:** Mapeamento dos problemas decorrentes da informalidade de acordos cotidianos entre pessoas físicas, por meio de análise qualitativa da realidade e revisão de soluções existentes (análise comparativa com plataformas similares).

**Etapa 2 — Levantamento de requisitos:** Definição dos requisitos funcionais e não funcionais do sistema, com base na problemática identificada e nas melhores práticas de sistemas de pagamento, reputação e acordos digitais. O levantamento considerou tanto as necessidades dos usuários comuns quanto as necessidades do painel administrativo.

**Etapa 3 — Modelagem do sistema:** Elaboração do modelo de dados com Prisma Schema, definição dos estados do ciclo de vida do acordo (máquina de estados), identificação dos atores, casos de uso e regras de negócio. Essa etapa resultou no modelo relacional implementado no PostgreSQL.

**Etapa 4 — Definição da arquitetura:** Escolha e definição da arquitetura do sistema — monorepo com pnpm workspaces, separação entre API e aplicativo mobile, organização modular do backend com NestJS, estratégia de autenticação JWT com dois contextos separados (usuário e administrador).

**Etapa 5 — Implementação iterativa:** Desenvolvimento progressivo das funcionalidades, começando pelos módulos essenciais (autenticação, carteira, acordos) e evoluindo para funcionalidades mais complexas (disputas, score, blockchain, cartão virtual). Cada módulo foi desenvolvido com sua estrutura completa de controller, service, DTOs e guards.

**Etapa 6 — Testes manuais e validação:** Execução e validação dos fluxos de ponta a ponta por meio do Swagger UI (documentação interativa da API), uso direto do aplicativo mobile e verificação de consistência dos dados no banco de dados.

**Etapa 7 — Documentação:** Geração da documentação automática via Swagger/OpenAPI para a API e elaboração do dossiê técnico do projeto como base para o presente TCC.

---

## 3.3 Tecnologias Utilizadas

A escolha das tecnologias foi orientada por critérios de adequação ao problema, maturidade e adoção na indústria, sinergia entre as ferramentas e compatibilidade com o ambiente de desenvolvimento disponível.

**Tabela 1 — Tecnologias utilizadas no projeto**

| Tecnologia | Versão | Função no Projeto |
|------------|--------|-------------------|
| TypeScript | 5.3 (API) / 5.9 (Mobile) | Linguagem principal — tipagem estática em todo o projeto |
| Node.js | ≥ 18 | Runtime do servidor (backend) |
| NestJS | 10.3.0 | Framework backend com injeção de dependência e arquitetura modular |
| Prisma | 5.9.1 | ORM type-safe, migrations versionadas e geração de tipos |
| PostgreSQL | 16 | Banco de dados relacional principal |
| Docker / Docker Compose | — | Containerização do banco de dados em ambiente de desenvolvimento |
| pnpm | 8+ | Gerenciador de pacotes e workspaces do monorepo |
| Expo | 54.0.35 | Plataforma de desenvolvimento React Native multiplataforma |
| React Native | 0.81.5 | Framework de desenvolvimento de aplicativo mobile |
| React | 19.1.0 | Biblioteca de componentes de interface |
| Expo Router | 6.0.24 | Sistema de roteamento baseado em arquivos para mobile |
| Axios | 1.7.7 | Cliente HTTP com interceptores de autenticação e tratamento de erros |
| expo-secure-store | — | Armazenamento seguro de tokens JWT no dispositivo |
| passport / passport-jwt | — | Estratégias de autenticação com JWT |
| bcryptjs | 2.4.3 | Hash seguro de senhas com salt |
| class-validator | 0.14.1 | Validação declarativa de DTOs com decorators |
| class-transformer | 0.5.1 | Serialização e transformação de objetos |
| @nestjs/swagger | 7.2.0 | Geração automática de documentação OpenAPI/Swagger |
| multer | 2.2.0 | Upload de arquivos (evidências em disputas) |
| @nestjs/throttler | 5.1.1 | Rate limiting (60 requisições por minuto por IP) |
| nanoid | 3.3.7 | Geração de identificadores únicos |
| Jest / ts-jest | 29.x | Framework de testes unitários |
| @expo/vector-icons | — | Biblioteca de ícones (Ionicons) para interface mobile |

**NestJS** foi escolhido como framework backend por sua arquitetura modular fortemente inspirada no Angular, com suporte nativo a injeção de dependência, decorators TypeScript, pipes de validação, guards de autenticação e geração automática de documentação Swagger. Essa estrutura favorece a separação de responsabilidades e a manutenibilidade do código.

**Prisma** foi adotado como ORM por oferecer tipagem estática completa das operações de banco de dados, geração automática de tipos TypeScript a partir do schema, suporte a migrations versionadas e uma API de consultas expressiva e segura contra SQL injection.

**Expo e React Native** foram escolhidos para o desenvolvimento mobile por permitirem a criação de aplicativos para iOS e Android a partir de uma única base de código TypeScript/JavaScript, com suporte a recarga rápida durante o desenvolvimento e acesso a APIs nativas do dispositivo.

---

## 3.4 Ambiente de Desenvolvimento

O projeto SeloPay é organizado como um **monorepo pnpm**, com a seguinte estrutura de alto nível:

```
SeloPay/
├── apps/
│   ├── api/        # Backend NestJS
│   └── mobile/     # Aplicativo Expo/React Native
├── packages/       # Pacotes compartilhados (estrutura criada, sem conteúdo no MVP)
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── .env
```

O monorepo permite que as duas aplicações (API e mobile) compartilhem configurações, convenções e, potencialmente, tipos e utilitários. O gerenciador de pacotes pnpm foi escolhido por seu suporte nativo a workspaces e por seu desempenho superior ao npm em repositórios com múltiplos pacotes.

**Banco de dados:** PostgreSQL 16 é executado via Docker Compose na porta 5435 (diferente da porta padrão 5432 para evitar conflitos com instalações locais). O banco de dados é nomeado `selopay`, com usuário `selopay` e senha configurada por variável de ambiente.

**Servidor de desenvolvimento da API:** A API NestJS é executada na porta 3333, com prefixo global `/api`. A documentação Swagger está disponível em `http://localhost:3333/docs`.

**Configuração de ambiente:** Variáveis de ambiente são gerenciadas por arquivo `.env` na raiz do monorepo, incluindo a URL de conexão com o banco, o segredo JWT para usuários (`JWT_SECRET`), o segredo JWT para administradores (`ADMIN_JWT_SECRET`) e configurações de expiração dos tokens.

**Seed de desenvolvimento:** O arquivo `apps/api/prisma/seed.ts` cria, no banco de dados vazio, um usuário administrador padrão e usuários de demonstração com saldo pré-configurado, permitindo testar todos os fluxos sem necessidade de criação manual de dados. O arquivo `reset-demo.ts` permite restaurar a base de dados ao estado inicial de demonstração.

**Execução:** O projeto é iniciado com o comando `pnpm dev` na raiz, que executa simultaneamente a API e o aplicativo mobile.

---

## 3.5 Critérios de Validação

A validação do MVP foi realizada de forma manual, seguindo a abordagem de testes exploratórios orientados por cenários. Os critérios adotados foram:

**Critério de completude funcional:** Cada fluxo principal definido nos requisitos funcionais foi executado de ponta a ponta, verificando se o resultado observado corresponde ao resultado esperado — incluindo a verificação direta dos dados no banco de dados PostgreSQL.

**Critério de consistência de dados:** Após cada operação financeira simulada (depósito, liberação, reembolso), os saldos da carteira (`availableBalance`, `blockedBalance`) foram verificados diretamente no banco de dados para confirmar que as transações atômicas funcionaram corretamente.

**Critério de segurança básica:** Foram testadas tentativas de acesso sem autenticação, acesso com token de usuário a rotas de administrador, tentativa de aceitar o próprio acordo e tentativa de confirmar acordos em estados inválidos — verificando se o sistema retornava os erros HTTP adequados.

**Critério de integridade do ciclo de vida:** O acordo foi conduzido por todos os estados possíveis (PENDING_ACCEPTANCE → ACTIVE → IN_DISPUTE → RESOLVED) para verificar se as transições seguiam as regras definidas e se o acordo não poderia ser colocado em estado inválido.

**Critério de typecheck:** A API e o aplicativo mobile foram submetidos ao compilador TypeScript (`tsc --noEmit`) para verificar que não havia erros de tipo, confirmando a consistência entre as interfaces, DTOs e implementações.

A ausência de testes automatizados de integração é reconhecida como limitação do MVP e discutida no Capítulo 7. A validação manual, embora limitada em cobertura e repetibilidade, foi suficiente para verificar a funcionalidade dos fluxos críticos do sistema no contexto acadêmico proposto.
