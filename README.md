# PTAM Giri Menang - Revenue Forecasting System

Sistem forecasting pendapatan untuk PTAM (Perusahaan Tirta Air Minum) Giri Menang yang mengintegrasikan model machine learning untuk prediksi pendapatan.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI**: Tailwind CSS
- **Charts**: Chart.js & react-chartjs-2
- **Date Handling**: date-fns

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:

- Node.js (v18 atau lebih tinggi)
- PostgreSQL (v14 atau lebih tinggi)
- npm atau yarn

## 🛠️ Setup & Installation

### 1. Clone atau Extract Project

```bash
cd ptam-forecasting
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database PostgreSQL

#### Opsi A: Menggunakan PostgreSQL Lokal

1. Install PostgreSQL di komputer Anda
2. Buat database baru:

```sql
CREATE DATABASE ptam_forecasting;
```

3. Update file `.env` dengan kredensial database Anda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ptam_forecasting?schema=public"
```

Ganti `username` dan `password` dengan kredensial PostgreSQL Anda.

#### Opsi B: Menggunakan PostgreSQL Cloud (Gratis)

Anda bisa menggunakan layanan seperti:

1. **Supabase** (Recommended - Free tier bagus)
   - Daftar di https://supabase.com
   - Buat project baru
   - Copy Database URL dari Settings > Database
   - Paste ke file `.env`

2. **Neon** (https://neon.tech) - Free tier unlimited

3. **Railway** (https://railway.app) - $5 kredit gratis

### 4. Setup Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Push schema ke database:

```bash
npm run prisma:push
```

Seed database dengan data dummy:

```bash
npm run prisma:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Project

```
ptam-forecasting/
├── app/
│   ├── api/                 # API Routes
│   │   ├── customers/       # Customer endpoints
│   │   ├── forecast/        # ML forecast endpoints
│   │   └── revenues/        # Revenue endpoints
│   ├── layout.js           # Root layout
│   ├── page.js             # Dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.js           # Header component
│   ├── DashboardStats.js   # Stats cards
│   ├── RevenueChart.js     # Line chart
│   ├── CustomerDistribution.js  # Pie chart
│   └── RevenueTable.js     # Data table
├── lib/
│   └── prisma.js           # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Seed data
├── .env                    # Environment variables
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
└── package.json            # Dependencies
```

## 🗄️ Database Schema

### Models Utama:

1. **User** - Admin dan user sistem
2. **Customer** - Data pelanggan
3. **Consumption** - Data konsumsi air per pelanggan
4. **Revenue** - Data pendapatan (aktual & forecast)
5. **ForecastResult** - Hasil prediksi dari ML model
6. **ModelPerformance** - Tracking performa model ML
7. **WaterTariff** - Konfigurasi tarif air

## 🔌 API Endpoints

### Revenues

```bash
# Get all revenues
GET /api/revenues?limit=10&type=ACTUAL

# Create new revenue
POST /api/revenues
{
  "period": "2024-07-01",
  "totalCustomers": 8500,
  "totalConsumption": 430000,
  "revenue": 2500000000,
  "type": "ACTUAL"
}
```

### Forecast (untuk integrasi dengan ML Model)

```bash
# Get forecasts
GET /api/forecast?limit=5

# Submit forecast from ML model
POST /api/forecast
Headers: x-api-key: your-ml-api-key
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

### Customers

```bash
# Get all customers
GET /api/customers?category=RUMAH_TANGGA&isActive=true

# Create new customer
POST /api/customers
{
  "customerCode": "CUS00051",
  "name": "John Doe",
  "address": "Jalan Mataram No. 123",
  "phone": "081234567890",
  "category": "RUMAH_TANGGA"
}
```

## 🤖 Integrasi dengan ML Model

### Cara Mengirim Prediksi dari Model ML ke Backend:

1. Model ML Anda harus memanggil endpoint POST `/api/forecast`
2. Sertakan API key di header: `x-api-key`
3. Kirim data prediksi dalam format JSON

Contoh menggunakan Python:

```python
import requests

url = "http://localhost:3000/api/forecast"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "your-ml-api-key"
}

data = {
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

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

## 🔧 Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run prisma:generate # Generate Prisma Client
npm run prisma:push     # Push schema to database
npm run prisma:studio   # Open Prisma Studio (GUI)
npm run prisma:seed     # Seed database with dummy data

# Linting
npm run lint            # Run ESLint
```

## 🎨 Kustomisasi

### Mengubah Warna Theme

Edit file `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#0077BE',      // Warna utama
      secondary: '#00A3E0',    // Warna sekunder
      accent: '#FF6B35',       // Warna aksen
      // ... tambahkan warna custom lainnya
    },
  },
}
```

### Menambah Menu/Halaman Baru

1. Buat file baru di folder `app/`:
   ```
   app/customers/page.js
   ```

2. Export component:
   ```jsx
   export default function CustomersPage() {
     return <div>Halaman Pelanggan</div>
   }
   ```

## 📊 Prisma Studio

Untuk melihat dan mengedit data secara visual:

```bash
npm run prisma:studio
```

Akan membuka GUI di http://localhost:5555

## 🚢 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di https://vercel.com
3. Set environment variables di Vercel
4. Deploy!

### Railway

1. Push code ke GitHub
2. Import project di https://railway.app
3. Tambahkan PostgreSQL plugin
4. Set environment variables
5. Deploy!

## 🐛 Troubleshooting

### Error: Cannot connect to database

- Pastikan PostgreSQL running
- Cek kredensial di `.env`
- Pastikan database sudah dibuat

### Error: Prisma Client not generated

```bash
npm run prisma:generate
```

### Error: Port 3000 already in use

```bash
# Ubah port di package.json
"dev": "next dev -p 3001"
```

## 📝 Todo / Next Steps

- [ ] Implementasi authentication dengan NextAuth.js
- [ ] Tambah halaman manajemen pelanggan
- [ ] Export data ke Excel/PDF
- [ ] Notifikasi real-time
- [ ] Dashboard analytics lebih detail
- [ ] Mobile app dengan React Native

## 📧 Support

Jika ada pertanyaan atau masalah, silakan buat issue atau hubungi tim development.

## 📄 License

MIT License
