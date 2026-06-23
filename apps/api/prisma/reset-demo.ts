/**
 * Reset completo da massa de desenvolvimento.
 * Apaga todos os dados na ordem correta (respeitando FKs) e recria
 * apenas Érika, Gustavo e Admin com carteiras zeradas.
 *
 * Uso:
 *   pnpm --filter api reset:demo
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function maskCpf(cpf: string): string {
  return cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2');
}

async function main() {
  console.log('🔄 SeloPay — Reset Demo\n');
  console.log('── Limpando dados ───────────────────────────────────────────');

  // 1. blockchain_records — refs opcionais (SetNull), sem cascade; deletar primeiro
  const bc = await prisma.blockchainRecord.deleteMany({});
  console.log(`  ⛓  blockchain_records:             ${bc.count}`);

  // 2. score_events — FK obrigatória para User sem onDelete → RESTRICT;
  //    precisa ser deletado antes dos users
  const se = await prisma.scoreEvent.deleteMany({});
  console.log(`  📊 score_events:                   ${se.count}`);

  // 3. agreements — cascade limpa:
  //    • agreement_confirmations
  //    • disputes → dispute_evidences, dispute_history,
  //                 dispute_responses → dispute_response_evidences
  //    • negotiations
  //    • simulated_payments
  //    wallet_transactions.agreementId → SetNull (opcional)
  //    card_transactions.agreementId  → SetNull (opcional)
  const ag = await prisma.agreement.deleteMany({});
  console.log(`  📝 agreements (+ cascades):        ${ag.count}`);

  // 4. users — cascade limpa:
  //    • wallets → wallet_transactions
  //    • pix_deposits
  //    • virtual_cards → card_transactions
  const us = await prisma.user.deleteMany({});
  console.log(`  👤 users (+ cascades):             ${us.count}`);

  // 5. admin_users — recriar limpo abaixo
  await prisma.adminUser.deleteMany({});
  console.log(`  🔐 admin_users:                    limpado`);

  console.log('\n── Recriando usuários ───────────────────────────────────────');

  // Admin
  await prisma.adminUser.create({
    data: {
      email: 'admin@selopay.com',
      name: 'Admin SeloPay',
      passwordHash: await bcrypt.hash('Admin@123', 10),
    },
  });
  console.log('  ✅ admin@selopay.com  (Admin@123)');

  // Usuários demo — carteiras zeradas, sem acordos, sem histórico
  const demos = [
    {
      name: 'Érika Neves',
      cpf: '111.222.333-44',
      email: 'erika@demo.com',
      password: 'Demo@123',
      seloKey: '@erika3F2A1B',
    },
    {
      name: 'Gustavo Neves',
      cpf: '444.555.666-77',
      email: 'gustavo@demo.com',
      password: 'Demo@123',
      seloKey: '@gustavo8C7D9E',
    },
  ];

  for (const u of demos) {
    await prisma.user.create({
      data: {
        name: u.name,
        cpf: u.cpf,
        cpfMasked: maskCpf(u.cpf),
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        seloKey: u.seloKey,
        score: 100,
        wallet: {
          create: { availableBalance: 0, blockedBalance: 0 },
        },
      },
    });
    console.log(`  ✅ ${u.email}  |  ${u.seloKey}  (Demo@123)`);
  }

  console.log('\n🎉 Reset concluído!\n');
  console.log('── Estado final ─────────────────────────────────────────────');
  console.log('  Acordos:        0');
  console.log('  Movimentações:  0');
  console.log('  Disputas:       0');
  console.log('  Blockchain:     0');
  console.log('  Cartões:        0 (criados ao ativar pelo app)');
  console.log('  Saldo Érika:    R$ 0,00');
  console.log('  Saldo Gustavo:  R$ 0,00');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  erika@demo.com    | Demo@123 | @erika3F2A1B');
  console.log('  gustavo@demo.com  | Demo@123 | @gustavo8C7D9E');
  console.log('  admin@selopay.com | Admin@123');
  console.log('─────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erro no reset:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
