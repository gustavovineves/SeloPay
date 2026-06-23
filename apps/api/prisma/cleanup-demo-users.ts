/**
 * Limpeza completa dos usuários demo (erika@demo.com e gustavo@demo.com).
 * Apaga todos os dados relacionados na ordem correta para evitar violações de FK.
 * Não apaga migrations, código, nem o AdminUser.
 *
 * Uso:
 *   cd apps/api
 *   npx ts-node prisma/cleanup-demo-users.ts
 *
 * Depois de rodar, execute o seed para recriar os usuários limpos:
 *   npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

const DEMO_EMAILS = ['erika@demo.com', 'gustavo@demo.com'];

async function main() {
  console.log('🧹 Iniciando limpeza dos usuários demo...\n');

  // ── 1. Localizar usuários ─────────────────────────────────────────────
  const users = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    include: { wallet: true },
  });

  if (users.length === 0) {
    console.log('⚠️  Nenhum usuário demo encontrado. Nada a limpar.');
    return;
  }

  const userIds = users.map((u) => u.id);
  const walletIds = users.map((u) => u.wallet?.id).filter(Boolean) as string[];

  for (const u of users) {
    console.log(`👤 ${u.email}  (id: ${u.id})`);
  }
  console.log();

  // ── 2. Localizar acordos envolvendo esses usuários ────────────────────
  const agreements = await prisma.agreement.findMany({
    where: { OR: [{ payerId: { in: userIds } }, { receiverId: { in: userIds } }] },
  });
  const agreementIds = agreements.map((a) => a.id);
  console.log(`📋 Acordos: ${agreementIds.length}`);

  // ── 3. Coletar caminhos de upload das disputas ────────────────────────
  const uploadPaths: string[] = [];

  if (agreementIds.length > 0) {
    const evidences = await prisma.disputeEvidence.findMany({
      where: { dispute: { agreementId: { in: agreementIds } } },
    });
    const responseEvidences = await prisma.disputeResponseEvidence.findMany({
      where: { response: { dispute: { agreementId: { in: agreementIds } } } },
    });
    uploadPaths.push(...evidences.map((e) => e.fileUrl));
    uploadPaths.push(...responseEvidences.map((e) => e.fileUrl));
    console.log(`📎 Arquivos de upload encontrados: ${uploadPaths.length}`);
  }

  console.log('\n── Removendo registros ──────────────────────────────────────');

  // ── 4. BlockchainRecord (acordos) — sem cascade de Agreement ─────────
  const bc1 = await prisma.blockchainRecord.deleteMany({
    where: { agreementId: { in: agreementIds } },
  });
  console.log(`⛓  BlockchainRecord (acordos):    ${bc1.count}`);

  // ── 5. BlockchainRecord (usuários) — CARD_ACTIVATED etc. ─────────────
  const bc2 = await prisma.blockchainRecord.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`⛓  BlockchainRecord (usuários):   ${bc2.count}`);

  // ── 6. CardTransaction (acordos) — sem cascade de Agreement ──────────
  const ct = await prisma.cardTransaction.deleteMany({
    where: { agreementId: { in: agreementIds } },
  });
  console.log(`💳 CardTransaction (acordos):     ${ct.count}`);

  // ── 7. WalletTransaction — carteiras + acordos ───────────────────────
  const wt = await prisma.walletTransaction.deleteMany({
    where: {
      OR: [
        { walletId: { in: walletIds } },
        ...(agreementIds.length > 0 ? [{ agreementId: { in: agreementIds } }] : []),
      ],
    },
  });
  console.log(`💰 WalletTransaction:             ${wt.count}`);

  // ── 8. ScoreEvent ─────────────────────────────────────────────────────
  const se = await prisma.scoreEvent.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`📊 ScoreEvent:                    ${se.count}`);

  // ── 9. DisputeResponse (autor = um dos usuários, fora de acordos deles)
  const dr = await prisma.disputeResponse.deleteMany({
    where: { authorId: { in: userIds } },
  });
  console.log(`💬 DisputeResponse (autor):       ${dr.count}`);

  // ── 10. AgreementConfirmation (userId, fora dos acordos deles) ────────
  const ac = await prisma.agreementConfirmation.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`✅ AgreementConfirmation:         ${ac.count}`);

  // ── 11. Acordos (cascade: confirmações, disputas, negociações, pagamentos)
  if (agreementIds.length > 0) {
    const ag = await prisma.agreement.deleteMany({
      where: { id: { in: agreementIds } },
    });
    console.log(`📝 Agreement (+ cascades):        ${ag.count}`);
  } else {
    console.log(`📝 Agreement:                     0`);
  }

  // ── 12. Usuários (cascade: wallet, pixDeposits, virtualCard + cardTx) ─
  const usr = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`👤 User (+ wallet, pix, cartão):  ${usr.count}`);

  // ── 13. Arquivos de upload ────────────────────────────────────────────
  const uploadsDir = path.resolve(__dirname, '..', 'uploads', 'disputes');
  let filesRemoved = 0;

  for (const fileUrl of uploadPaths) {
    try {
      const filename = path.basename(new URL(fileUrl).pathname);
      const fullPath = path.join(uploadsDir, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        filesRemoved++;
        console.log(`🗑  Arquivo removido: ${filename}`);
      }
    } catch {
      // URL inválida ou arquivo já inexistente — ignorar
    }
  }

  if (uploadPaths.length === 0) {
    console.log('📁 Nenhum arquivo de upload para remover');
  } else if (filesRemoved === 0) {
    console.log(`📁 Nenhum arquivo encontrado em disco (${uploadPaths.length} ref. no DB)`);
  } else {
    console.log(`📁 ${filesRemoved} arquivo(s) de upload removidos`);
  }

  // ── Resumo ────────────────────────────────────────────────────────────
  console.log('\n✅ Limpeza concluída com sucesso!\n');
  console.log('── Próximo passo ──────────────────────────────────────────');
  console.log('  cd apps/api');
  console.log('  npx ts-node prisma/seed.ts');
  console.log('');
  console.log('  Ou pelo monorepo:');
  console.log('  pnpm --filter api prisma:seed');
  console.log('──────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erro durante a limpeza:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
