# 📚 Analisis Lengkap Codebase PTAM Forecasting

## 🎯 Tujuan Project

Sistem forecasting pendapatan untuk PTAM Giri Menang yang mengintegrasikan model ML Python untuk memprediksi pendapatan berdasarkan data konsumsi air pelanggan.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│         FRONTEND (React + Tailwind CSS)                  │
│  - Dashboard with stats & charts                         │
│  - Revenue chart (Actual vs Forecast)                    │
│  - Customer distribution                                 │
│  - Revenue table                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         BACKEND (Next.js API Routes)                     │
│  - /api/customers  - Manage customer data                │
│  - /api/revenues   - Get actual revenue data             │
│  - /api/forecast   - Receive ML predictions              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         DATABASE (PostgreSQL + Prisma ORM)               │
│  - User, Customer, Consumption                           │
│  - Revenue (ACTUAL & FORECAST type)                      │
│  - ForecastResult, ModelPerformance                      │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
           ┌─────────────────────────┐
           │  EXTERNAL ML MODEL      │
           │  (Python - Friend)      │
           │  - Analyzes patterns    │
           │  - Generates forecast   │
           └─────────────────────────┘
```

---

## 📊 Database Schema (Prisma)

### 1. **User** - Manajemen pengguna sistem

```
- id (cuid) - Primary key
- email (unique) - Email pengguna
- name - Nama lengkap
- role - ADMIN / MANAGER / VIEWER
- password - Hashed password
- timestamps - createdAt, updatedAt
```

### 2. **Customer** - Data pelanggan

```
- id (cuid)
- customerCode (unique) - Kode unik pelanggan
- name - Nama pelanggan
- address - Alamat
- phone - Nomor telepon
- category - RUMAH_TANGGA / KOMERSIAL / INDUSTRI / SOSIAL
- isActive - Status aktif
- timestamps
- relations: consumptions[], revenues[]
```

### 3. **Consumption** - Data konsumsi air

```
- id (cuid)
- customerId (FK) - Link ke Customer
- period - Bulan konsumsi
- meterStart - Angka meter awal (m³)
- meterEnd - Angka meter akhir (m³)
- consumption - Total konsumsi (m³)
- timestamps
```

### 4. **Revenue** - Pendapatan (Aktual & Forecast)

```
- id (cuid)
- customerId (FK, nullable) - Link ke Customer
- period - Bulan terkait
- totalCustomers - Jumlah pelanggan aktif
- totalConsumption - Total konsumsi (m³)
- revenue - Total pendapatan (Rupiah)
- type - ACTUAL / FORECAST
- accuracy - Akurasi prediksi (%)
- confidenceLevel - Confidence level (%)
- timestamps
```

### 5. **ForecastResult** - Hasil prediksi detail (untuk ML model)

```
- id (cuid)
- period - Periode prediksi
- predictedRevenue - Nilai prediksi
- lowerBound - Batas bawah confidence interval
- upperBound - Batas atas confidence interval
- confidence - Confidence level
- modelVersion - Versi model yang digunakan
- features - JSON: features yang digunakan model
- timestamps
```

### 6. **ModelPerformance** - Tracking performa model

```
- id (cuid)
- mae - Mean Absolute Error
- mape - Mean Absolute Percentage Error
- rmse - Root Mean Square Error
- r2Score - R² Score
- modelVersion - Versi model
- timestamps
```

### 7. **WaterTariff** - Tarif air berdasarkan kategori

```
- id (cuid)
- category - Kategori pelanggan
- minUsage / maxUsage - Range penggunaan (m³)
- pricePerM3 - Harga per m³
- effectiveFrom - Tanggal berlaku
```

---

## 📁 Struktur File & Folder

### `/app` - Next.js App Directory

#### `layout.js` - Root layout

- Setup HTML struktur global
- Import global CSS

#### `page.js` - Dashboard utama

```javascript
// Key functions:
getDashboardData() - Server-side data fetching
  ├─ Get 8 bulan terakhir revenue data
  ├─ Customer distribution by category
  ├─ Stats: total customers, current revenue, forecast
  └─ Model accuracy dari latest ModelPerformance
```

#### `/api` - REST API Endpoints

**POST /api/forecast** - Menerima prediksi dari ML model

```
Request Headers:
- x-api-key: ML_MODEL_API_KEY (untuk validasi)

Request Body:
{
  period: "2024-02-01",
  predictedRevenue: 1500000000,
  lowerBound: 1450000000,
  upperBound: 1550000000,
  confidence: 95.5,
  modelVersion: "v1.0",
  features: { /* feature list */ },
  totalCustomers: 1250,
  totalConsumption: 5000
}

Response:
- Saves ke ForecastResult table
- Saves ke Revenue table (type: FORECAST)
```

**GET /api/forecast** - Ambil daftar prediksi

```
Query params:
- limit: berapa hasil yang diambil (default: 5)

Response:
- Array of ForecastResult objects
```

**GET /api/revenues** - Ambil data pendapatan

```
Query params:
- limit: jumlah data (default: 10)
- type: "ACTUAL" atau "FORECAST"

Response:
- Array of Revenue dengan customer details
```

**POST /api/revenues** - Tambah data pendapatan manual

```
Body:
{
  period: date,
  totalCustomers: number,
  totalConsumption: number,
  revenue: number,
  type: "ACTUAL" | "FORECAST",
  accuracy?: number,
  confidenceLevel?: number
}
```

**GET /api/customers** - Ambil daftar pelanggan

```
Query params:
- category: "RUMAH_TANGGA" | "KOMERSIAL" | "INDUSTRI" | "SOSIAL"
- isActive: "true" | "false"

Response:
- Array of customers dengan latest consumption
```

**POST /api/customers** - Tambah pelanggan baru

---

## 🎨 Frontend Components

### `/components/DashboardStats.js`

**Menampilkan 4 KPI cards:**

1. **Pendapatan Bulan Ini** - Revenue aktual terbaru
2. **Forecast Bulan Depan** - Prediksi + % perubahan
3. **Total Pelanggan** - Jumlah pelanggan aktif
4. **Akurasi Model** - Dari ModelPerformance.mape

```javascript
formatCurrency(amount) - Format ke Rp XXM
calculateChange(current, previous) - Hitung % perubahan
```

### `/components/RevenueChart.js`

**Chart.js Line Chart dengan 2 datasets:**

1. **Pendapatan Aktual** - Garis biru solid
2. **Forecast** - Garis oranye dashed

Features:

- Responsive
- Interactive tooltips
- Fill area under line
- Hover effects

### `/components/CustomerDistribution.js`

**Pie/Doughnut chart menampilkan:**

- Distribusi pelanggan per kategori
- RUMAH_TANGGA, KOMERSIAL, INDUSTRI, SOSIAL

### `/components/RevenueTable.js`

**Table dengan kolom:**

- Periode
- Total Customers
- Consumption (m³)
- Revenue (Rp)
- Type (ACTUAL/FORECAST)
- Akurasi

### `/components/Header.js`

**Navigation & branding**

- Logo PTAM
- Judul "Forecasting Dashboard"
- User info (optional)

---

## 🔌 Tech Stack & Dependencies

```json
{
  "next": "^14.2.0", // Framework fullstack
  "react": "^18.3.0", // UI library
  "@prisma/client": "^5.15.0", // ORM untuk database
  "chart.js": "^4.4.0", // Chart library
  "react-chartjs-2": "^5.2.0", // React wrapper untuk Chart.js
  "date-fns": "^3.6.0", // Date manipulation
  "zod": "^3.23.0", // Schema validation
  "axios": "^1.7.0", // HTTP client
  "tailwindcss": "^3.4.0" // CSS framework
}
```

---

## 🚀 Proses Integrasi dengan Model Python

### Flow Saat Ini (Dummy Data)

```
Database (Seed Data)
    ↓
page.js (Data Fetching)
    ↓
Components (Display)
    ↓
Browser (UI)
```

### Flow Setelah Integrasi ML Model

```
┌─────────────────────────────────────┐
│  Python ML Model (Teman Anda)       │
│  - Train dengan historical data     │
│  - Generate forecast untuk bulan    │
│  - Hitung confidence interval       │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ POST /api/forecast  │
    │ (dengan x-api-key)  │
    │ Headers & Body      │
    └────────┬────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Save ke database    │
    │ - ForecastResult    │
    │ - Revenue (FORECAST)│
    │ - ModelPerformance  │
    └────────┬────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Frontend Update     │
    │ - Charts refresh    │
    │ - Stats updated     │
    │ - Table populated   │
    └─────────────────────┘
```

### Langkah Integrasi:

**1. ML Model (Python) - Prediction Script**

```python
# Pseudo-code
import requests
import json

# Baca data dari database PTAM
historical_data = fetch_ptam_data()

# Train model
model.fit(historical_data)

# Generate forecast
forecast = model.predict(next_period)
confidence = model.get_confidence()

# Kirim ke Next.js API
payload = {
    "period": "2024-02-01",
    "predictedRevenue": forecast.revenue,
    "lowerBound": forecast.lower,
    "upperBound": forecast.upper,
    "confidence": confidence,
    "modelVersion": "v1.0",
    "features": forecast.features,
    "totalCustomers": 1250,
    "totalConsumption": 5000
}

response = requests.post(
    "http://localhost:3000/api/forecast",
    headers={"x-api-key": "your-secret-key"},
    json=payload
)
```

**2. Environment Variables yang Diperlukan**

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/ptam_forecasting"
ML_MODEL_API_KEY="secret-api-key-dari-python"
ML_MODEL_ENDPOINT="http://localhost:5000"  # Jika Python berjalan local
```

**3. Scheduler (Opsional)**

- Gunakan cron job atau task scheduler
- Run Python model setiap bulan
- Kirim hasil ke Next.js API
- Trigger chart refresh di frontend

---

## 🔑 Key Integration Points

### 1. **POST /api/forecast** - Menerima data model

- Validate x-api-key header
- Parse forecast data
- Save ke ForecastResult & Revenue
- Return success/error

### 2. **GET /api/revenues** - Dashboard membaca data

- Fetch ACTUAL data dari historical
- Fetch FORECAST data dari model prediction
- Merge & sort by period
- Display di RevenueChart

### 3. **DashboardStats.js** - Tampilkan metric penting

- Current month revenue (dari ACTUAL terbaru)
- Next month forecast (dari FORECAST terbaru)
- % change calculation
- Model accuracy (dari ModelPerformance.mape)

### 4. **RevenueChart.js** - Visualisasi trend

- Data ACTUAL = garis biru
- Data FORECAST = garis oranye dashed
- Combined view untuk perbandingan

---

## 🎓 Cara Memahami Alur Data

### Jika Membaca Kode dari Atas ke Bawah:

```
1. page.js (Root)
   ├─ getDashboardData() - Fetch dari Prisma
   └─ Pass data ke components

2. Components
   ├─ DashboardStats.js - Format & display metrics
   ├─ RevenueChart.js - Chart data visualization
   ├─ CustomerDistribution.js - Customer breakdown
   ├─ RevenueTable.js - Tabular data
   └─ Header.js - Navigation

3. API Routes (/api)
   ├─ GET /revenues - Fetch dari database
   ├─ POST /forecast - Terima dari Python model
   └─ GET /customers - Fetch customer data

4. Database (Prisma)
   └─ All tables with relations
```

### Jika Membaca dari Bawah ke Atas:

```
1. Database (PostgreSQL)
   └─ Contains historical data & seed data

2. Prisma ORM
   ├─ schema.prisma - Table definitions
   └─ lib/prisma.js - Client initialization

3. API Routes
   ├─ GET endpoints - Query database
   └─ POST endpoints - Insert/update data

4. Frontend
   ├─ page.js - Data fetching & assembly
   └─ Components - Rendering & visualization
```

---

## 📝 Dummy Data yang Ada (dari seed.js)

**Seeds Database Dengan:**

- 1 Admin User + 1 Manager User
- 7 Water Tariffs (berbagai kategori & usage range)
- 50 Customers (mix dari semua kategori)
- 6 bulan Consumption data per customer
- Revenue data (ACTUAL & FORECAST)
- Model performance metrics

---

## 🔄 Proses Forecasting (High Level)

```
PTAM Historical Data (6+ bulan)
    ↓
[Python ML Model]
- Feature engineering (konsumsi, pelanggan, tarif, trend)
- Pattern recognition
- Time series analysis
- Generate forecast
    ↓
Forecast Output:
- Predicted revenue
- Confidence interval (lower & upper bound)
- Accuracy metrics (MAE, MAPE, RMSE)
    ↓
POST /api/forecast (dengan API key)
    ↓
Saved to Database:
- ForecastResult (detail prediksi)
- Revenue (simplified view)
- ModelPerformance (tracking model quality)
    ↓
Frontend Displays:
- Updated charts
- New forecast stats
- Model accuracy metrics
```

---

## ⚠️ Important Notes untuk Integrasi

1. **API Security**
   - Set unique `ML_MODEL_API_KEY` di `.env`
   - Validate header di POST /api/forecast
   - Consider CORS if model runs on different domain

2. **Data Consistency**
   - Ensure period format consistency (ISO 8601)
   - Revenue amounts dalam Rupiah (IDR)
   - Consumption dalam cubic meters (m³)

3. **Error Handling**
   - Invalid API key → 401 Unauthorized
   - Missing fields → 400 Bad Request
   - Database error → 500 Internal Server Error

4. **Performance Optimization**
   - Add database indexes on frequently queried fields
   - Consider pagination for large datasets
   - Cache forecast results appropriately

5. **Testing Integration**
   - Use Postman/curl untuk test POST /api/forecast
   - Verify data appears in database
   - Check frontend charts update correctly

---

## 📊 Visualisasi Data Flow

```
┌─ MONTHLY PROCESS ─────────────────────────┐
│                                            │
│ Month End → Python Model Runs             │
│   ↓                                        │
│ Fetch last 6+ months from /api/revenues   │
│   ↓                                        │
│ Train model & generate forecast           │
│   ↓                                        │
│ POST to /api/forecast with predictions    │
│   ↓                                        │
│ Data saved to PostgreSQL                  │
│   ↓                                        │
│ Dashboard auto-updates with new forecast  │
│   ↓                                        │
│ Managers view updated predictions         │
│   ↓                                        │
│ Compare actual vs forecast for next month │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🎯 Summary

Anda sudah membuat foundation yang solid:

- ✅ Next.js fullstack app dengan clean architecture
- ✅ PostgreSQL + Prisma untuk type-safe database operations
- ✅ Beautiful dashboard dengan Tailwind CSS
- ✅ API endpoints siap menerima forecast dari Python
- ✅ Dummy data untuk testing UI

Tinggal connect dengan Python ML model teman Anda!

Saat teman Anda siap dengan model, dia cukup POST ke `/api/forecast` dengan format yang sudah disiapkan, dan sistem akan otomatis update dashboard.
