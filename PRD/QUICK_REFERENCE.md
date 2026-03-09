# ⚡ Quick Reference Guide

Panduan cepat untuk memahami dan bekerja dengan PTAM Forecasting System.

---

## 🗂️ File Structure Quick Reference

```
ptam-forecasting/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── .env                      # Environment variables
│   ├── next.config.js            # Next.js config
│   ├── tailwind.config.js        # Tailwind CSS
│   └── jsconfig.json             # JS path aliases
│
├── 📱 Frontend (React Components)
│   ├── app/
│   │   ├── layout.js             # Root layout
│   │   ├── page.js               # Dashboard page (main)
│   │   ├── globals.css           # Global styles
│   │   └── api/                  # REST API endpoints
│   │       ├── forecast/         # POST/GET forecasts
│   │       ├── revenues/         # GET/POST revenues
│   │       └── customers/        # GET/POST customers
│   │
│   └── components/               # Reusable React components
│       ├── Header.js             # Navigation
│       ├── DashboardStats.js     # KPI cards
│       ├── RevenueChart.js       # Line chart
│       ├── CustomerDistribution.js # Doughnut chart
│       └── RevenueTable.js       # Data table
│
├── 🗄️ Database (Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (7 models)
│   │   ├── seed.js               # Dummy data generation
│   │   └── migrations/           # Migration history
│   │
│   └── lib/
│       └── prisma.js             # Prisma client singleton
│
└── 📚 Documentation (NEW!)
    ├── README.md                 # Original setup guide
    ├── CODEBASE_ANALYSIS.md      # Detailed codebase walkthrough
    ├── INTEGRATION_GUIDE.md      # Python ML integration steps
    ├── COMPONENTS_GUIDE.md       # Component deep dive
    └── QUICK_REFERENCE.md        # This file!
```

---

## 🚀 Getting Started (3 Steps)

### Step 1: Setup

```bash
cd ptam-forecasting
npm install
npm run prisma:push      # Create tables
npm run prisma:seed      # Add dummy data
```

### Step 2: Run

```bash
npm run dev
# Open http://localhost:3000
```

### Step 3: Understand

```
Read CODEBASE_ANALYSIS.md for full walkthrough
```

---

## 📊 Database Tables (7 Models)

### Quick Overview

| Model                | Purpose              | Key Fields                                     |
| -------------------- | -------------------- | ---------------------------------------------- |
| **User**             | Authenticate users   | email, password, role (ADMIN/MANAGER/VIEWER)   |
| **Customer**         | Store customer info  | customerCode, name, category, isActive         |
| **Consumption**      | Water usage tracking | customerId, period, consumption (m³)           |
| **Revenue**          | Pendapatan data      | period, revenue (Rp), type (ACTUAL/FORECAST)   |
| **ForecastResult**   | ML prediction detail | period, predictedRevenue, confidence, features |
| **ModelPerformance** | Model metrics        | mae, mape, rmse, r2Score                       |
| **WaterTariff**      | Tarif/pricing        | category, minUsage, maxUsage, pricePerM3       |

### Most Important Tables

```
Customer
├─ customerCode (unique)
├─ name
├─ category (RUMAH_TANGGA, KOMERSIAL, INDUSTRI, SOSIAL)
└─ isActive (true/false)

Revenue (THE MAIN TABLE)
├─ period (bulan terkait)
├─ revenue (Rp - Rupiah)
├─ type (ACTUAL atau FORECAST)
├─ totalCustomers
├─ totalConsumption (m³)
├─ accuracy (%)
└─ confidenceLevel (%)
```

---

## 🔌 API Endpoints

### Key Endpoints

```
POST /api/forecast
├─ Purpose: Terima prediksi dari ML model
├─ Header: x-api-key (REQUIRED)
├─ Body: { period, predictedRevenue, lowerBound, upperBound, ... }
└─ Saves to: ForecastResult + Revenue tables

GET /api/revenues
├─ Purpose: Ambil revenue data
├─ Query: ?limit=10&type=ACTUAL
└─ Returns: Array of Revenue records

GET /api/customers
├─ Purpose: Ambil customer list
├─ Query: ?category=RUMAH_TANGGA&isActive=true
└─ Returns: Array of Customer records

GET /api/forecast
├─ Purpose: Ambil forecast history
├─ Query: ?limit=5
└─ Returns: Array of ForecastResult records
```

### Most Used Endpoint

```bash
# POST /api/forecast - Receive forecast from Python model
curl -X POST http://localhost:3000/api/forecast \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "period": "2024-02-01",
    "predictedRevenue": 1500000000,
    "lowerBound": 1450000000,
    "upperBound": 1550000000,
    "confidence": 95.5,
    "modelVersion": "v1.0",
    "totalCustomers": 1250,
    "totalConsumption": 5000
  }'
```

---

## 🎨 Frontend Components

### Component Import Chain

```
page.js (server component)
├─ getDashboardData() - Fetch from Prisma
└─ Render components with data:
   ├─ <Header />
   ├─ <DashboardStats stats={data.stats} />
   ├─ <RevenueChart revenues={data.revenues} />
   ├─ <CustomerDistribution distribution={data.customersByCategory} />
   └─ <RevenueTable revenues={data.revenues} />
```

### Component Input/Output

| Component                | Input                  | Output                              |
| ------------------------ | ---------------------- | ----------------------------------- |
| **DashboardStats**       | `stats` object         | 4 KPI cards                         |
| **RevenueChart**         | `revenues[]` array     | Line chart (Actual vs Forecast)     |
| **CustomerDistribution** | `distribution[]` array | Doughnut chart (category breakdown) |
| **RevenueTable**         | `revenues[]` array     | Data table (top 5 records)          |
| **Header**               | None                   | Navigation bar                      |

---

## 💾 Data Fetching Flow

### In page.js

```javascript
// 1. Get dashboard data (server-side)
async function getDashboardData() {
  const revenues = await prisma.revenue.findMany({
    orderBy: { period: "desc" },
    take: 8,
  });

  const customersByCategory = await prisma.customer.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: true,
  });

  const stats = {
    totalCustomers: await prisma.customer.count({ where: { isActive: true } }),
    currentMonthRevenue: await prisma.revenue.findFirst({
      where: { type: "ACTUAL" },
      orderBy: { period: "desc" },
    }),
    nextMonthForecast: await prisma.revenue.findFirst({
      where: { type: "FORECAST" },
      orderBy: { period: "asc" },
    }),
    modelAccuracy: latestPerformance ? 100 - latestPerformance.mape : null,
  };

  return { revenues, customersByCategory, stats };
}

// 2. Render with data
export default function Dashboard() {
  const data = getDashboardData();

  return (
    <>
      <Header />
      <DashboardStats stats={data.stats} />
      <RevenueChart revenues={data.revenues} />
      <CustomerDistribution distribution={data.customersByCategory} />
      <RevenueTable revenues={data.revenues} />
    </>
  );
}
```

---

## 🧮 Common Calculations

### Currency Formatting

```javascript
// Convert IDR to display format
const formatCurrency = (amount) => {
  return `Rp ${(amount / 1000000).toFixed(1)}M`;
};

// Example:
formatCurrency(1500000000); // Output: "Rp 1.5M"
formatCurrency(450000000); // Output: "Rp 0.5M"
```

### Percentage Change

```javascript
const calculateChange = (current, previous) => {
  if (!previous) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

// Example:
calculateChange(1600000000, 1500000000); // Output: "6.7"
```

### Date Formatting

```javascript
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Format date to locale Indonesian
format(new Date("2024-01-31"), "MMMM yyyy", { locale: id });
// Output: "Januari 2024"

format(new Date("2024-01-31"), "MMM yyyy", { locale: id });
// Output: "Jan 2024"
```

---

## 🔐 Environment Variables

### Required `.env` File

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ptam_forecasting"
DIRECT_URL="postgresql://user:password@localhost:5432/ptam_forecasting"

# ML Model Security
ML_MODEL_API_KEY="your-secret-api-key-here"

# Optional: ML Model Endpoint
ML_MODEL_ENDPOINT="http://localhost:5000"
```

### Check Environment

```bash
# Print env variables (be careful with secrets!)
echo $ML_MODEL_API_KEY
echo $DATABASE_URL
```

---

## 🐛 Common Issues & Solutions

### ❌ "ForecastResult table doesn't exist"

**Solution:**

```bash
npm run prisma:push
```

### ❌ Database connection error

**Solution:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Recreate connection string
DATABASE_URL="postgresql://username:password@localhost:5432/ptam_forecasting"
```

### ❌ "Module not found: Chart.js"

**Solution:**

```bash
npm install chart.js react-chartjs-2
```

### ❌ 401 Unauthorized on /api/forecast

**Solution:**

- Check API key in header matches .env
- API key must be EXACTLY same in both places
- Don't forget "x-api-key" header name

### ❌ Port 3000 already in use

**Solution:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 📈 Integration Checklist

### Before connecting Python model:

- [ ] Update `.env` with `ML_MODEL_API_KEY`
- [ ] Test `/api/forecast` endpoint with curl/Postman
- [ ] Verify database is populated with seed data
- [ ] Dashboard loads without errors
- [ ] Charts display dummy data correctly

### When Python model is ready:

- [ ] Get forecast prediction from model
- [ ] POST to `/api/forecast` with API key header
- [ ] Verify response is 200 OK
- [ ] Check database for new ForecastResult & Revenue records
- [ ] Refresh dashboard and verify chart updates

### Production deployment:

- [ ] Change API key to strong random string
- [ ] Use HTTPS for API calls
- [ ] Set up monitoring/logging
- [ ] Schedule model to run monthly via cron

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed database with dummy data
npm run prisma:seed

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Start development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🎯 Key Concepts

### ACTUAL vs FORECAST

```
ACTUAL = Historical data from real measurements
├─ Konsumsi air yang sudah terjadi
├─ Pendapatan yang sudah diterima
└─ Digambar dengan garis BIRU solid

FORECAST = Predicted data from ML model
├─ Konsumsi air yang diperkirakan
├─ Pendapatan yang diperkirakan
└─ Digambar dengan garis ORANYE dashed
```

### Revenue Type

```
Revenue table menyimpan BOTH actual dan forecast
├─ type: 'ACTUAL' = historical data
└─ type: 'FORECAST' = ML model prediction

Difference from ForecastResult:
├─ ForecastResult = detailed ML output (confidence, features, bounds)
└─ Revenue = simplified view (just period & amount)
```

### Confidence Interval

```
Forecast menyediakan range prediksi:
├─ lowerBound = optimistic scenario (bisa lebih rendah)
├─ predictedRevenue = expected value
└─ upperBound = pessimistic scenario (bisa lebih tinggi)

Contoh:
├─ Lower: Rp 1.45 Miliar
├─ Predicted: Rp 1.5 Miliar (expected)
└─ Upper: Rp 1.55 Miliar
```

---

## 📚 Reading Order

For someone new to the project, read in this order:

1. **README.md** - Overview & setup
2. **CODEBASE_ANALYSIS.md** - Understand architecture
3. **COMPONENTS_GUIDE.md** - Learn UI components
4. **INTEGRATION_GUIDE.md** - Know how to connect Python
5. **QUICK_REFERENCE.md** - This file, for quick lookups

---

## 🔗 Key Files to Know

| File                        | Purpose                | When to modify                     |
| --------------------------- | ---------------------- | ---------------------------------- |
| `app/page.js`               | Main dashboard         | Add new components or data queries |
| `prisma/schema.prisma`      | Database structure     | Add new tables/fields              |
| `app/api/forecast/route.js` | ML prediction endpoint | Change validation logic            |
| `components/*.js`           | UI components          | Change styling or layout           |
| `.env`                      | Configuration          | Add API keys or database URL       |

---

## 💡 Tips & Tricks

### Debug database queries

```bash
npm run prisma:studio
# Opens http://localhost:5555 with GUI for database
```

### Test API endpoints

```bash
# Using curl
curl -X GET http://localhost:3000/api/revenues?limit=5

# Using Postman
# Import collection or create requests manually
```

### View Next.js console logs

```bash
# Terminal where npm run dev is running
# Shows all console.log() output
```

### Check Prisma generated code

```bash
# Location: node_modules/.prisma/client
# Contains TypeScript definitions from schema
```

---

## 🎓 Next Learning Steps

1. **Understand Prisma better:**
   - Read schema.prisma thoroughly
   - Learn about relations (@relation)
   - Practice with prisma studio

2. **Deep dive into Next.js:**
   - Server vs Client components
   - App Router vs Pages Router
   - API route structure

3. **Chart.js mastery:**
   - Try different chart types
   - Customize colors/styles
   - Add animations

4. **Prepare for ML integration:**
   - Plan API payload format
   - Design error handling
   - Plan for monitoring/alerts

---

## 📞 Quick Help

**Q: Where's the dashboard?**
A: `app/page.js` - It's the root page

**Q: How do I add a new field to Customer?**
A: Edit `prisma/schema.prisma`, then run `npm run prisma:push`

**Q: How does ML model send data?**
A: POST to `/api/forecast` endpoint with API key header

**Q: Where's the database?**
A: PostgreSQL, connection string in `.env` as DATABASE_URL

**Q: How do I add a new component?**
A: Create file in `/components`, export function, import in `page.js`

**Q: Can I run this without Node.js?**
A: No, Next.js requires Node.js v18+

**Q: How do I deploy to production?**
A: See README.md - Deploy to Vercel, Railway, or self-hosted

---

## 🎉 You're All Set!

Anda sekarang sudah punya fondasi yang solid untuk:

- ✅ Understand architecture
- ✅ Make modifications
- ✅ Integrate with Python ML model
- ✅ Deploy to production

Semua files yang Anda butuhkan sudah siap. Tinggal tunggu teman Anda selesai dengan Python model, lalu start integrating! 🚀
