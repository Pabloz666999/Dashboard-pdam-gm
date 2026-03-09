import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const pythonUrl = process.env.PYTHON_FORECAST_URL || 'http://127.0.0.1:8000'
    
    // Ambil jumlah bulan dari request body jika ada, atau default ke 12
    const body = await request.json().catch(() => ({ months: 12 }))
    const n = body.months || 12

    const [resPendapatan, resPelanggan, resPemakaian] = await Promise.all([
      fetch(`${pythonUrl}/forecast/pendapatan?n=${n}`), // Menggunakan variabel n
      fetch(`${pythonUrl}/forecast/pelanggan?n=${n}`),
      fetch(`${pythonUrl}/forecast/pemakaian?n=${n}`)
    ])

    // ... sisa logika penggabungan data (map) tetap sama

    const dataPendapatan = await resPendapatan.json()
    const dataPelanggan = await resPelanggan.json()
    const dataPemakaian = await resPemakaian.json()

    // 2. Gabungkan data berdasarkan periode (Tanggal)
    const combinedForecast = dataPendapatan.map((item, index) => ({
      period: new Date(item.periode),
      revenue: item.forecast_pendapatan,
      totalCustomers: Math.round(dataPelanggan[index]?.forecast_pelanggan || 0),
      totalConsumption: Math.round(dataPemakaian[index]?.forecast_pemakaian || 0), // Ini untuk kolom m3
      type: 'FORECAST'
    }))

    // 3. Bersihkan data ramalan lama & Simpan data ramalan baru ke Database
    await prisma.$transaction([
      prisma.revenue.deleteMany({ where: { type: 'FORECAST' } }),
      prisma.revenue.createMany({ data: combinedForecast })
    ])

    return NextResponse.json({ success: true, message: 'Dashboard PTAM Berhasil Diperbarui' })
  } catch (error) {
    console.error('Sync Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}