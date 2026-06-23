import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    select: {
      email: true,
      score: true,
      wallet: { select: { availableBalance: true, blockedBalance: true } },
    },
  });
  console.log('\n── Usuários ──────────────────────────────────────────');
  for (const u of users) {
    console.log(
      `  ${u.email}  score=${u.score}  ` +
      `disponível=${u.wallet?.availableBalance ?? 0}  bloqueado=${u.wallet?.blockedBalance ?? 0}`,
    );
  }

  const agreements = await p.agreement.count();
  const scoreEvents = await p.scoreEvent.count();
  const notifications = (p as any).notification ? await (p as any).notification.count() : 'N/A (sem modelo)';
  const blockchain = await p.blockchainRecord.count();
  const cards = await p.virtualCard.count();
  const disputes = await p.dispute.count();
  const admin = await p.adminUser.findFirst({ select: { email: true, name: true } });

  console.log('\n── Contagens globais ─────────────────────────────────');
  console.log(`  agreements:       ${agreements}`);
  console.log(`  scoreEvents:      ${scoreEvents}`);
  console.log(`  blockchainRecord: ${blockchain}`);
  console.log(`  virtualCard:      ${cards}`);
  console.log(`  dispute:          ${disputes}`);

  console.log('\n── Admin ─────────────────────────────────────────────');
  console.log(admin ? `  ✅ ${admin.email} (${admin.name})` : '  ❌ Não encontrado!');
  console.log('──────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
