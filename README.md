# SeloPay

**Plataforma digital para registro e garantia simulada de acordos entre usuários**

> Projeto acadêmico de TCC — Ciência da Computação.
> Todos os pagamentos, saldos, Pix, blockchain e escrow são **simulados** para fins de demonstração.
> Nenhuma operação financeira real é realizada.

---

## O que é o SeloPay?

O SeloPay transforma acordos informais — empréstimos, prestação de serviço, combinados de pagamento — em registros digitais verificáveis. Dois usuários podem:

1. Criar um acordo digital com valor, prazo e descrição.
2. Depositar uma **garantia simulada** (escrow) que fica bloqueada até o cumprimento.
3. **Confirmar mutuamente** a conclusão para liberar o valor.
4. Abrir uma **contestação** se algo der errado — com envio de evidências.
5. Resolver disputas via **painel administrativo**.
6. Construir **reputação** baseada no histórico de comportamento.

---

## Funcionalidades principais

- Cadastro com **SeloKey** única (identidade pública do usuário)
- Acordo simples (sem garantia) e **acordo com garantia simulada**
- Três fontes de depósito: carteira interna, Pix simulado, cartão virtual
- **Dupla confirmação** obrigatória para liberar o valor
- Contestação com upload de evidências e resposta da contraparte
- Painel administrativo com resolução de disputas
- **Score de reputação** comportamental
- **Cartão virtual** com limite calculado pelo score
- **Blockchain interno** (cadeia SHA256) para rastreabilidade de eventos
- Renegociação de prazo de acordos
- Carteira com saldo disponível e bloqueado

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend / API | NestJS 10 + TypeScript |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma 5.9 |
| App mobile | Expo 54 + React Native 0.81 |
| Roteamento mobile | Expo Router 6 |
| Autenticação | JWT (dois contextos separados: usuário / admin) |
| Validação | class-validator + class-transformer |
| Documentação | Swagger / OpenAPI |
| Gerenciador de pacotes | pnpm 8 (monorepo com workspaces) |
| Containerização | Docker Compose (PostgreSQL) |

---

## Estrutura do projeto

```
SeloPay/
├── apps/
│   ├── api/              # Backend NestJS (REST API)
│   │   ├── prisma/       # Schema, migrations, seed, reset-demo
│   │   └── src/
│   │       └── modules/  # auth, users, wallet, agreements, disputes,
│   │                     # admin, score, blockchain, virtual-card
│   └── mobile/           # Expo/React Native
│       ├── app/          # Telas (Expo Router file-based)
│       │   ├── (auth)/   # Login, cadastro
│       │   ├── (tabs)/   # Home, carteira, acordos, perfil
│       │   ├── (admin)/  # Painel admin (disputas)
│       │   └── agreements/
│       └── src/
│           ├── contexts/  # AuthContext, AdminAuthContext
│           ├── services/  # api.ts (Axios)
│           ├── types/     # Tipos TypeScript globais
│           └── theme/     # Cores, tipografia, espaçamentos
├── docs/                 # Documentação complementar
├── tcc/                  # Dossiê e texto completo do TCC
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .env.example
└── package.json
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|-----------|--------------|-----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| Docker Desktop | qualquer | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Git | qualquer | [git-scm.com](https://git-scm.com) |
| Expo Go (opcional) | qualquer | App Store / Google Play |

---

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/SeloPay.git
cd SeloPay
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

O `.env.example` já contém os valores corretos para desenvolvimento local. **Não é necessário alterar nada** para rodar localmente.

### 3. Instalar dependências

```bash
pnpm install
```

### 4. Subir o banco de dados (PostgreSQL via Docker)

```bash
docker compose up -d
```

Isso inicia o PostgreSQL 16 na porta **5435** com:
- Banco: `selopay`
- Usuário: `selopay`
- Senha: `selopay_dev_pass`

### 5. Executar migrations do Prisma

```bash
pnpm prisma:deploy
```

> Se for a primeira vez ou quiser rodar em modo dev (com regeneração de cliente):
> ```bash
> pnpm prisma:generate
> ```

### 6. Executar seed (dados iniciais)

```bash
pnpm prisma:seed
```

Isso cria o usuário administrador e dois usuários de demonstração.

### 7. Rodar a API

```bash
pnpm dev:api
```

A API estará disponível em: `http://localhost:3333`
Documentação Swagger: `http://localhost:3333/docs`

### 8. Rodar o app mobile

Em outro terminal:

```bash
pnpm dev:mobile
```

Escaneie o QR Code com o **Expo Go** (iOS/Android) ou pressione `a` para Android ou `i` para iOS (requer simulador instalado).

> A variável `EXPO_PUBLIC_API_URL` no `.env` aponta para a API. Em dispositivo físico, substitua `localhost` pelo IP local da sua máquina.

---

## Usuários de demonstração

Após o seed, os seguintes usuários estão disponíveis:

### Administrador

| Campo | Valor |
|-------|-------|
| E-mail | `admin@selopay.com` |
| Senha | `Admin@123` |
| Acesso | Tela admin dentro do app mobile |

### Usuários comuns

| Campo | Érika | Gustavo |
|-------|-------|---------|
| E-mail | `erika@demo.com` | `gustavo@demo.com` |
| Senha | `Demo@123` | `Demo@123` |
| SeloKey | `@erika3F2A1B` | `@gustavo8C7D9E` |

---

## Fluxo principal para testar

Para testar o fluxo completo de acordo com garantia:

1. **Login como Érika** (`erika@demo.com`)
2. **Adicionar saldo demo**: `POST /api/wallet/simulate-credit` `{ "amount": 500 }`
   (ou via botão "Depositar" no app)
3. **Criar acordo**: informar SeloKey do Gustavo (`@gustavo8C7D9E`), valor R$ 100, descrição e data
4. **Login como Gustavo** e aceitar o acordo
5. **Login como Érika** e depositar garantia (escolher: carteira, Pix ou cartão)
6. **Login como Gustavo** e confirmar (`READY_TO_RECEIVE`)
7. **Login como Érika** e confirmar (`OBLIGATION_FULFILLED`)
8. Valor liberado automaticamente → acordo `COMPLETED`

**Para testar disputa:**
- Após o aceite e depósito, uma das partes abre contestação
- Login como admin para visualizar e resolver

---

## Scripts disponíveis

### Raiz do projeto

```bash
pnpm dev:api          # Rodar API em modo watch
pnpm dev:mobile       # Rodar app mobile (Expo)
pnpm build:api        # Build de produção da API
pnpm prisma:generate  # Gerar cliente Prisma
pnpm prisma:migrate   # Criar nova migration (dev)
pnpm prisma:deploy    # Aplicar migrations (produção/CI)
pnpm prisma:studio    # Abrir Prisma Studio (visualizador do banco)
pnpm prisma:seed      # Criar dados iniciais
pnpm reset:demo       # Resetar base de dados ao estado inicial de demo
```

### API (`apps/api`)

```bash
pnpm --filter api dev            # Dev mode com hot reload
pnpm --filter api build          # Build TypeScript
pnpm --filter api reset:demo     # Reset completo da massa de dados
pnpm --filter api prisma studio  # Prisma Studio
```

### Mobile (`apps/mobile`)

```bash
pnpm --filter mobile start    # Expo com QR Code
pnpm --filter mobile android  # Abrir no Android
pnpm --filter mobile ios      # Abrir no iOS
```

---

## Resetar dados de demonstração

Para retornar o banco ao estado inicial (apaga acordos, disputas, saldos):

```bash
pnpm reset:demo
```

---

## Documentação complementar

| Arquivo | Conteúdo |
|---------|---------|
| [docs/SETUP.md](docs/SETUP.md) | Instalação passo a passo detalhada |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura, entidades e fluxos |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Visão geral do produto |
| [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md) | Roteiro completo de demonstração |
| [docs/API.md](docs/API.md) | Endpoints da API REST |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Problemas comuns e soluções |

---

## Aviso importante

> O SeloPay é um **MVP acadêmico** desenvolvido para TCC.
>
> - **Pix** é simulado — nenhum código real é processado
> - **Saldo e carteira** são valores fictícios no banco de dados
> - **Blockchain** é uma cadeia de hashes SHA256 em PostgreSQL (não distribuído)
> - **Cartão virtual** é um limite interno — sem bandeira ou processadora real
> - **Escrow/garantia** é um bloqueio de saldo simulado — sem custódia real
> - **Nenhum dado financeiro real** é coletado ou processado

---

## Status do projeto

MVP acadêmico funcional:
- API REST: 35+ endpoints, documentados via Swagger
- App mobile: 20+ telas cobrindo os fluxos principais
- Painel administrativo integrado ao mobile

Em desenvolvimento:
- Notificações push (FCM/APNs)
- Testes automatizados completos

---

## Licença

[MIT](LICENSE)
