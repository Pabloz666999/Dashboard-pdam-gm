const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

const prisma = new PrismaClient()

// Fungsi untuk memetakan nama_golongan ke enum CustomerCategory di Prisma
function mapCategory(golongan) {
  if (!golongan) return 'RUMAH_TANGGA'
  const prefix = String(golongan).charAt(0) // Ambil angka depannya saja (1, 2, 3, 4)
  switch (prefix) {
    case '1': return 'SOSIAL'
    case '2': return 'RUMAH_TANGGA'
    case '3': return 'KOMERSIAL'
    case '4': return 'INDUSTRI'
    default: return 'RUMAH_TANGGA'
  }
}

async function main() {
  console.log('🌱 Seeding database dengan data historis PTAM...')

  // Hapus data lama agar bersih
  await prisma.modelPerformance.deleteMany()
  await prisma.forecastResult.deleteMany()
  await prisma.revenue.deleteMany()
  await prisma.consumption.deleteMany()
  await prisma.waterTariff.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Buat User
  await prisma.user.create({
    data: {
      email: 'admin@ptam.com',
      name: 'Admin Budi',
      role: 'ADMIN',
      password: 'hashed_password_here', 
    },
  })
  console.log('✅ Created user admin')

  // 2. Data Pendapatan Aktual 2024-2025
  const actualRevenues = [
    { period: new Date('2024-01-01'), customers: 6050, consumption: 83958, revenue: 482609750 },
    { period: new Date('2024-02-01'), customers: 6055, consumption: 83113, revenue: 481270950 },
    { period: new Date('2024-03-01'), customers: 6062, consumption: 79122, revenue: 456330100 },
    { period: new Date('2024-04-01'), customers: 6068, consumption: 83892, revenue: 485151450 },
    { period: new Date('2024-05-01'), customers: 6075, consumption: 82536, revenue: 505560600 },
    { period: new Date('2024-06-01'), customers: 6082, consumption: 85981, revenue: 522169400 },
    { period: new Date('2024-07-01'), customers: 6090, consumption: 80327, revenue: 472567650 },
    { period: new Date('2024-08-01'), customers: 6095, consumption: 82411, revenue: 485746100 },
    { period: new Date('2024-09-01'), customers: 6102, consumption: 87146, revenue: 533179950 },
    { period: new Date('2024-10-01'), customers: 6110, consumption: 86449, revenue: 504053100 },
    { period: new Date('2024-11-01'), customers: 6118, consumption: 92727, revenue: 551488700 },
    { period: new Date('2024-12-01'), customers: 6125, consumption: 83213, revenue: 483472200 },
    { period: new Date('2025-01-01'), customers: 6132, consumption: 84209, revenue: 494316100 },
    { period: new Date('2025-02-01'), customers: 6140, consumption: 83328, revenue: 505465750 },
    { period: new Date('2025-03-01'), customers: 6148, consumption: 78668, revenue: 487118550 },
    { period: new Date('2025-04-01'), customers: 6155, consumption: 88980, revenue: 530676800 },
    { period: new Date('2025-05-01'), customers: 6162, consumption: 82602, revenue: 510286500 },
    { period: new Date('2025-06-01'), customers: 6170, consumption: 83134, revenue: 515622100 },
    { period: new Date('2025-07-01'), customers: 6178, consumption: 80152, revenue: 500363750 },
    { period: new Date('2025-08-01'), customers: 6185, consumption: 81711, revenue: 523075800 },
    { period: new Date('2025-09-01'), customers: 6192, consumption: 86380, revenue: 536629200 },
    { period: new Date('2025-10-01'), customers: 6200, consumption: 83860, revenue: 535579100 },
    { period: new Date('2025-11-01'), customers: 6208, consumption: 84728, revenue: 533053350 },
    { period: new Date('2025-12-01'), customers: 6215, consumption: 81272, revenue: 518717300 },
  ]
  
  await prisma.revenue.createMany({
    data: actualRevenues.map(d => ({
      period: d.period,
      totalCustomers: d.customers,
      totalConsumption: d.consumption,
      revenue: d.revenue,
      type: 'ACTUAL',
    }))
  })
  console.log('✅ Created 24 months of actual revenue data')

  // 3. PARSING DATA PELANGGAN DARI FILE CSV PYTHON (DYNAMIC & REAL)
  console.log('⏳ Membaca file CSV Pelanggan asli... (Ini akan memakan waktu beberapa detik)')
  
  // Karena folder Python berada di luar folder Next.js, kita naik dua tingkat dari folder 'prisma'
  const csvFilePath = path.join(__dirname, '../../forecasting-pdam-gm-master/data/processed/drd-gerung-2024-2025.csv')
  
  if (!fs.existsSync(csvFilePath)) {
    console.log(`⚠️ File CSV tidak ditemukan di: ${csvFilePath}`)
    console.log('Pastikan folder "forecasting-pdam-gm-master" posisinya berdampingan persis dengan folder proyek Next.js Anda.')
    return;
  }

  const uniqueCustomers = new Map()

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Ambil data unik berdasarkan nomor langganan
        const noLangganan = row.no_langganan
        if (noLangganan && !uniqueCustomers.has(noLangganan)) {
          uniqueCustomers.set(noLangganan, {
            customerCode: noLangganan,
            name: row.nama ? row.nama.replace(/\*/g, '') : 'Tanpa Nama', // Membersihkan sedikit karakter sensor
            address: row.kelurahan || 'Lainnya',
            category: mapCategory(row.nama_golongan),
            isActive: true
          })
        }
      })
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
  })

  const customersArray = Array.from(uniqueCustomers.values())
  console.log(`📊 Ditemukan ${customersArray.length} pelanggan unik asli dari CSV. Menyimpan ke database...`)

  // Memasukkan data menggunakan "Batch" (per 2000 baris) agar Supabase tidak memblokir limit koneksi
  const BATCH_SIZE = 2000;
  for (let i = 0; i < customersArray.length; i += BATCH_SIZE) {
    const batch = customersArray.slice(i, i + BATCH_SIZE)
    await prisma.customer.createMany({
      data: batch,
      skipDuplicates: true
    })
    console.log(`   Memasukkan data pelanggan ke ${i + 1} sampai ${Math.min(i + BATCH_SIZE, customersArray.length)}...`)
  }

  console.log('✅ Berhasil menyimpan seluruh data pelanggan asli ke database!')
  console.log('🎉 Seeding completed! Database siap digunakan.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })