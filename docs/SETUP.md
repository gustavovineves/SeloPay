# Guia de Instalação — SeloPay

Passo a passo completo para rodar o SeloPay em sua máquina local.

---

## Pré-requisitos

Instale as seguintes ferramentas antes de começar:

| Ferramenta | Versão | Como instalar |
|-----------|--------|--------------|
| Node.js | 18 ou superior | https://nodejs.org |
| pnpm | 8 ou superior | `npm install -g pnpm` |
| Docker Desktop | qualquer | https://www.docker.com/products/docker-desktop/ |
| Git | qualquer | https://git-scm.com |
| Expo Go (opcional, para mobile) | qualquer | App Store / Google Play |

Verifique as instalações:

```bash
node --version   # deve ser v18+
pnpm --version   # deve ser 8+
docker --version
git --version
```

---

## Passo 1 — Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/SeloPay.git
cd SeloPay
```

---

## Passo 2 — Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

O `.env.example` já contém os valores corretos para desenvolvimento local. Não é necessário alterar nada para rodar localmente.

**Variáveis importantes:**

| Variável | Valor padrão | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | `postgresql://selopay:selopay_dev_pass@localhost:5435/selopay?schema=public` | URL de conexão com o banco |
| `JWT_SECRET` | `selopay_jwt_secret_change_in_production` | Segredo JWT para usuários |
| `ADMIN_JWT_SECRET` | `selopay_admin_jwt_secret_change_in_production` | Segredo JWT para admin |
| `PORT` | `3333` | Porta da API |
| `ADMIN_EMAIL` | `admin@selopay.com` | E-mail do admin criado no seed |
| `ADMIN_PASSWORD` | `Admin@123` | Senha do admin criado no seed |

> Em produção, sempre substitua os valores de `JWT_SECRET` e `ADMIN_JWT_SECRET` por strings aleatórias longas.

---

## Passo 3 — Instalar dependências

Na raiz do projeto (instala dependências de todos os workspaces):

```bash
pnpm install
```

---

## Passo 4 — Banco de dados (Docker)

Inicie o PostgreSQL 16:

```bash
docker compose up -d
```

Confirme que o container está rodando:

```bash
docker ps
```

Deve aparecer `selopay_postgres` com status `Up`.

**Detalhes do banco:**
- Host: `localhost`
- Porta: `5435` (não padrão, para evitar conflito com instalações locais)
- Banco: `selopay`
- Usuário: `selopay`
- Senha: `selopay_dev_pass`

> Se a porta 5435 estiver em uso, altere no `docker-compose.yml` e atualize o `DATABASE_URL` no `.env`.

---

## Passo 5 — Migrations do Prisma

Aplique as migrations ao banco de dados:

```bash
pnpm prisma:deploy
```

Se você quiser rodar em modo de desenvolvimento (com geração de cliente e criação interativa de migration):

```bash
pnpm --filter api prisma:migrate
```

---

## Passo 6 — Gerar o cliente Prisma

Se necessário (geralmente `prisma:deploy` já faz isso):

```bash
pnpm prisma:generate
```

---

## Passo 7 — Seed (dados iniciais)

Crie o admin e os usuários de demonstração:

```bash
pnpm prisma:seed
```

Isso criará:
- Admin: `admin@selopay.com` / `Admin@123`
- Érika: `erika@demo.com` / `Demo@123` / SeloKey: `@erika3F2A1B`
- Gustavo: `gustavo@demo.com` / `Demo@123` / SeloKey: `@gustavo8C7D9E`

O seed é **idempotente** — pode ser rodado múltiplas vezes sem duplicar dados.

---

## Passo 8 — Rodar a API

```bash
pnpm dev:api
```

A API estará disponível em:
- **Base URL:** `http://localhost:3333/api`
- **Swagger UI:** `http://localhost:3333/docs`

Aguarde a mensagem `[Nest] ... Application is listening on port 3333`.

---

## Passo 9 — Rodar o app mobile

Em um **novo terminal**:

```bash
pnpm dev:mobile
```

Opções de execução:

| Opção | Comando | Requisito |
|-------|---------|-----------|
| QR Code no celular | `pnpm dev:mobile` + scan com Expo Go | Expo Go instalado |
| Simulador Android | Pressionar `a` no terminal | Android Studio + emulador |
| Simulador iOS | Pressionar `i` no terminal | Xcode (somente macOS) |
| Navegador (web) | Pressionar `w` no terminal | Limitado |

> **Em dispositivo físico:** O mobile precisa alcançar a API pela rede local. Substitua `localhost` no `.env` pelo IP da sua máquina (ex: `192.168.1.100`):
> ```
> EXPO_PUBLIC_API_URL=http://192.168.1.100:3333/api
> ```

---

## Resetar dados de demonstração

Para apagar todos os acordos, disputas e saldos e restaurar o estado inicial:

```bash
pnpm reset:demo
```

---

## Verificar instalação

Após os passos acima, confirme que tudo está funcionando:

1. Acesse `http://localhost:3333/docs` — deve abrir o Swagger UI
2. No Swagger, chame `POST /api/auth/login` com `{ "email": "erika@demo.com", "password": "Demo@123" }`
3. Deve retornar um token JWT

---

## Parar o ambiente

Para parar a API: `Ctrl+C` no terminal da API
Para parar o Docker: `docker compose down`
Para parar e apagar os dados do banco: `docker compose down -v`
