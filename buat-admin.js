const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Biarkan laptop Anda yang menghitung hash-nya agar 100% cocok!
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Masukkan otomatis ke database
  await prisma.user.upsert({
    where: { email: 'admin@ptam.co.id' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@ptam.co.id',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('SUKSES BIKIN HASH LOKAL!')
  console.log('Silakan login pakai -> admin123')
}

main().finally(() => prisma.$disconnect())