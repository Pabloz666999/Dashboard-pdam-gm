# 🚀 Quick Start Guide - PTAM Forecasting

Panduan cepat untuk memulai project dalam 5 menit!

## 📦 Yang Anda Butuhkan

1. **Node.js** - Download di https://nodejs.org (pilih LTS version)
2. **PostgreSQL** - Pilih salah satu:
   - 💻 Lokal: Download di https://www.postgresql.org/download/
   - ☁️ Cloud (GRATIS): https://supabase.com (recommended untuk pemula)

## ⚡ Langkah-langkah Setup (5 Menit)

### 1️⃣ Install Dependencies

Buka terminal/command prompt di folder project, lalu jalankan:

```bash
npm install
```

Tunggu sampai selesai (biasanya 1-2 menit).

### 2️⃣ Setup Database

#### Opsi A: Menggunakan Supabase (GRATIS & MUDAH) ⭐ RECOMMENDED

1. Buka https://supabase.com dan daftar akun (gratis)
2. Klik "New Project"
3. Isi nama project: `ptam-forecasting`
4. Buat password database (catat baik-baik!)
5. Pilih region terdekat (Singapore)
6. Tunggu project selesai dibuat (~2 menit)
7. Klik "Settings" > "Database"
8. Copy "Connection String" yang ada tulisan "URI"
9. Paste ke file `.env` bagian `DATABASE_URL`

Contoh hasil:
```env
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.supabase.co:5432/postgres"
```

#### Opsi B: Menggunakan PostgreSQL Lokal

1. Install PostgreSQL
2. Buat database baru bernama `ptam_forecasting`
3. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ptam_forecasting"
```
(Ganti `password` dengan password PostgreSQL Anda)

### 3️⃣ Setup Database Schema & Data

Jalankan perintah ini satu per satu:

```bash
npm run prisma:generate
```

```bash
npm run prisma:push
```

```bash
npm run prisma:seed
```

✅ Database sudah siap dengan data dummy!

### 4️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

🎉 **SELESAI!** Dashboard sudah bisa Anda lihat!

## 📱 Fitur yang Sudah Tersedia

✅ Dashboard dengan 4 kartu statistik  
✅ Grafik pendapatan aktual vs forecast  
✅ Grafik distribusi pelanggan  
✅ Tabel data pendapatan  
✅ API endpoints untuk integrasi ML model  
✅ Database dengan 50 data pelanggan dummy  
✅ 6 bulan data historis  

## 🔗 Integrasi dengan Model ML Teman Anda

Minta teman Anda yang bikin model ML untuk mengirim prediksi ke endpoint ini:

**URL**: `http://localhost:3000/api/forecast`  
**Method**: POST  
**Headers**:
```
Content-Type: application/json
x-api-key: your-ml-api-key
```

**Body**:
```json
{
  "period": "2024-08-01",
  "predictedRevenue": 2850000000,
  "lowerBound": 2700000000,
  "upperBound": 3000000000,
  "confidence": 94.5,
  "modelVersion": "v1.3.0",
  "totalCustomers": 8600,
  "totalConsumption": 445000,
  "features": {
    "seasonal_trend": 0.12,
    "customer_growth": 0.08
  }
}
```

## 🎨 Melihat & Edit Data

Jalankan Prisma Studio:

```bash
npm run prisma:studio
```

Akan membuka GUI di http://localhost:5555 untuk edit data langsung.

## ❓ Troubleshooting

### "Cannot connect to database"
- Cek koneksi internet (kalau pakai Supabase)
- Cek file `.env`, pastikan `DATABASE_URL` sudah benar
- Pastikan password tidak ada typo

### "Port 3000 already in use"
Ada aplikasi lain yang pakai port 3000. Ubah port:
```bash
next dev -p 3001
```

### "Module not found"
Install ulang dependencies:
```bash
rm -rf node_modules
npm install
```

## 📞 Butuh Bantuan?

Baca file `README.md` untuk dokumentasi lengkap!

---

**Pro Tip**: Simpan URL Supabase Dashboard Anda, nanti berguna untuk monitoring database! 🚀
