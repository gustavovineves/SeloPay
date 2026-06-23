import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function maskCpf(cpf: string): string {
  return cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2');
}

async function main() {
  console.log('🌱 Iniciando seed SeloPay...\n');

  // ── Admin ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@selopay.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        name: 'Admin SeloPay',
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    });
    console.log(`✅ AdminUser criado: ${adminEmail}`);
  } else {
    console.log(`⏭️  AdminUser já existe: ${adminEmail}`);
  }

  // ── Usuários demo ──────────────────────────────────────────────────────
  // Apenas duas contas. Sem acordos, sem saldo, sem histórico.
  const usersData = [
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

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });

    if (existing) {
      console.log(`⏭️  Usuário já existe: ${u.email}`);
      // Garante que a carteira existe, mesmo que tenha sido criada sem ela
      const wallet = await prisma.wallet.findUnique({ where: { userId: existing.id } });
      if (!wallet) {
        await prisma.wallet.create({
          data: { userId: existing.id, availableBalance: 0, blockedBalance: 0 },
        });
        console.log(`   💳 Carteira criada para ${u.email}`);
      }
      continue;
    }

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

    console.log(`✅ Usuário criado: ${u.email}  |  seloKey: ${u.seloKey}`);
  }

  console.log('\n🎉 Seed concluído!');
  console.log('\n── Contas disponíveis ──────────────────────────────');
  console.log('  erika@demo.com    | Demo@123 | seloKey: @erika3F2A1B');
  console.log('  gustavo@demo.com  | Demo@123 | seloKey: @gustavo8C7D9E');
  console.log(`  ${adminEmail} | ${adminPassword} (admin)`);
  console.log('────────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
