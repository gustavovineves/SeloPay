# Troubleshooting — SeloPay

Soluções para os problemas mais comuns ao instalar e rodar o SeloPay.

---

## Banco de dados / Docker

### Problema: Porta 5435 já está em uso

**Sintoma:**
```
Error response from daemon: driver failed programming external connectivity:
Bind for 0.0.0.0:5435 failed: port is already allocated
```

**Solução:**

Encontre o processo na porta 5435:

```bash
# Windows
netstat -ano | findstr :5435

# macOS / Linux
lsof -i :5435
```

Encerre o processo ou altere a porta no `docker-compose.yml`:

```yaml
ports:
  - "5436:5432"  # use 5436 no lugar de 5435
```

E atualize o `DATABASE_URL` no `.env`:

```
DATABASE_URL=postgresql://selopay:selopay_dev_pass@localhost:5436/selopay?schema=public
```

---

### Problema: Container não sobe / "connection refused"

**Sintoma:** API tenta conectar mas o banco recusa.

**Verificações:**

```bash
# Veja se o container está rodando
docker ps

# Veja os logs do container
docker logs selopay_postgres
```

**Solução:** Se o container não aparece ou mostra erros, recrie:

```bash
docker compose down
docker compose up -d
```

Se persistir, apague o volume e recrie do zero:

```bash
docker compose down -v   # atenção: apaga todos os dados
docker compose up -d
pnpm prisma:deploy
pnpm prisma:seed
```

---

### Problema: Prisma "Engine DLL locked" (Windows)

**Sintoma:**
```
Error: EPERM: operation not permitted, unlink '...query-engine-windows.dll.node'
```

**Causa:** O Prisma Engine está em uso por outro processo Node.

**Solução:**

1. Encerre todos os processos Node:
   - Pressione `Ctrl+C` em todos os terminais com `pnpm dev:api`
   - Se necessário: `taskkill /F /IM node.exe` (Windows)
2. Rode `pnpm prisma:generate` novamente
3. Reinicie a API

---

### Problema: `pnpm prisma:migrate` solicita nome da migration

**Sintoma:** O comando fica esperando input interativo.

**Causa:** `prisma migrate dev` é interativo — solicita o nome da migration.

**Solução:** Passe o nome diretamente:

```bash
pnpm --filter api exec prisma migrate dev --name nome_da_migration
```

Ou use `prisma:deploy` (não interativo) para apenas aplicar migrations existentes:

```bash
pnpm prisma:deploy
```

---

## API / NestJS

### Problema: API não inicia — "Cannot find module"

**Sintoma:**
```
Error: Cannot find module '@prisma/client'
```

**Solução:**

```bash
pnpm install
pnpm prisma:generate
pnpm dev:api
```

---

### Problema: "secret or public key must be provided" no JWT

**Sintoma:** Erro ao tentar fazer login ou acessar rotas protegidas.

**Causa:** A variável `JWT_SECRET` ou `ADMIN_JWT_SECRET` está vazia ou não carregada.

**Solução:**

1. Verifique se o arquivo `.env` existe na raiz do projeto (`SeloPay/.env`)
2. Confirme que as variáveis estão preenchidas:
   ```
   JWT_SECRET=selopay_jwt_secret_change_in_production
   ADMIN_JWT_SECRET=selopay_admin_jwt_secret_change_in_production
   ```
3. Reinicie a API

---

### Problema: 403 Forbidden ao acessar rotas de admin

**Causa:** Usando o token do usuário comum onde é necessário o token de admin.

**Solução:** Obtenha o token de admin via `POST /api/admin/auth/login` com as credenciais do administrador. Os dois tokens são **diferentes e não intercambiáveis**.

---

### Problema: Rate limit (429 Too Many Requests)

**Causa:** O throttler limita 60 requisições por minuto por IP.

**Solução:** Aguarde 1 minuto. Em desenvolvimento, o limite pode ser ajustado em `apps/api/src/main.ts` (não recomendado para produção).

---

## App Mobile / Expo

### Problema: "Network request failed" — mobile não conecta na API

**Causa mais comum:** O mobile está rodando em dispositivo físico e tentando acessar `localhost`, que não aponta para a máquina do desenvolvedor.

**Solução:**

1. Descubra o IP local da sua máquina:
   ```bash
   # Windows
   ipconfig
   # macOS / Linux
   ifconfig | grep inet
   ```
2. Edite o `.env` (ou `apps/mobile/.env`) e atualize:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3333/api
   ```
   (substitua `192.168.1.100` pelo IP encontrado)
3. Reinicie o Expo (`Ctrl+C` + `pnpm dev:mobile`)

---

### Problema: QR Code do Expo não conecta / app trava na splash

**Verificações:**

- O celular e o computador estão na **mesma rede Wi-Fi**?
- O firewall do Windows está bloqueando a porta 8081 (Expo) ou 3333 (API)?

**Solução para firewall (Windows):**

```
Painel de Controle → Firewall do Windows Defender
→ Configurações Avançadas → Regras de Entrada
→ Nova Regra → Porta → TCP → Portas específicas: 3333, 8081
→ Permitir a conexão
```

---

### Problema: "Metro bundler exited" ou "Unable to resolve module"

**Solução:**

```bash
# Limpar cache do Metro
pnpm --filter mobile start --clear

# Se persistir, limpar completamente
cd apps/mobile
npx expo start --clear
```

---

### Problema: Tela em branco no app / erro silencioso

**Solução:** Ative o Developer Menu no simulador ou dispositivo:

- Android: `Ctrl+M` (emulador) ou agitar dispositivo
- iOS: `Cmd+D` (simulador) ou agitar dispositivo

Selecione **"Debug Remote JS"** para ver o console completo no navegador.

---

## Dados / Seed

### Problema: Seed falha com "Unique constraint violation"

**Causa:** O seed já foi rodado anteriormente — os usuários demo já existem.

**Comportamento esperado:** O seed é idempotente — usa `upsert` para não duplicar dados. Se mesmo assim ocorrer erro, verifique se as migrations foram aplicadas corretamente.

---

### Problema: Usuário demo existe mas sem carteira

**Causa:** O seed foi rodado mas a criação da carteira falhou parcialmente.

**Solução:** Rode o reset:

```bash
pnpm reset:demo
```

Isso recria todos os dados de demonstração do zero.

---

### Problema: Acordo travado em estado intermediário após erro

**Causa:** Erro de rede ou interrupção durante uma transação de acordo.

**Solução rápida:** Use o Prisma Studio para inspecionar o estado:

```bash
pnpm prisma:studio
```

Acesse `http://localhost:5555` e verifique a tabela `Agreement`. Em desenvolvimento, é possível alterar o `status` manualmente para desfazer o estado.

---

## Ambiente / pnpm

### Problema: Erro ao instalar — "EACCES" ou permissão negada

**Solução (macOS/Linux):**

```bash
sudo chown -R $(whoami) ~/.pnpm-store
```

**Solução (Windows):** Execute o terminal como Administrador.

---

### Problema: "workspace:*" — dependência não resolvida

**Causa:** Tentativa de instalar dentro de um workspace filho sem estar na raiz.

**Solução:** Sempre instale da raiz do monorepo:

```bash
cd SeloPay   # raiz do projeto
pnpm install
```

---

## Ainda com problemas?

1. Verifique se o `.env` existe e está preenchido corretamente
2. Confirme que o Docker está rodando: `docker ps`
3. Rode `pnpm install` na raiz para garantir que todas as dependências estão instaladas
4. Verifique os logs da API para o erro exato
5. Abra o Prisma Studio (`pnpm prisma:studio`) para inspecionar o estado do banco
