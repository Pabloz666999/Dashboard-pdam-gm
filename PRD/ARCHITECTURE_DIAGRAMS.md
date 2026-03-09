# 📊 Visual Architecture Diagrams

Visualisasi lengkap untuk memahami sistem PTAM Forecasting.

---

## 1. Overall System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                     PTAM FORECASTING SYSTEM                          ║
╚══════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 FRONTEND LAYER (Browser)                                         │
│                                                                      │
│   Next.js React App @ localhost:3000                                │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ Dashboard (page.js)                                        │    │
│   ├────────────────────────────────────────────────────────────┤    │
│   │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │    │
│   │ │  Stats   │ │ Revenue  │ │ Customer │ │ Revenue  │       │    │
│   │ │  Cards   │ │  Chart   │ │  Pie     │ │  Table   │       │    │
│   │ │          │ │          │ │          │ │          │       │    │
│   │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │    │
│   └────────────────────────────────────────────────────────────┘    │
└─────────────────────────┬──────────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼──────────────────────────────────────────┐
│ 🔌 API LAYER (Next.js API Routes)                                  │
│                                                                     │
│   /api/revenues    →  GET/POST revenue data                        │
│   /api/customers   →  GET/POST customer data                       │
│   /api/forecast    →  GET/POST ML predictions                      │
│                                                                     │
│   Route Handlers:                                                   │
│   - Validate requests                                              │
│   - Call Prisma ORM                                                │
│   - Return JSON responses                                          │
└─────────────────────────┬──────────────────────────────────────────┘
                          │ Prisma Client
┌─────────────────────────▼──────────────────────────────────────────┐
│ 🗄️ DATABASE LAYER (PostgreSQL)                                     │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │ User         │  │ Customer     │  │ Consumption  │             │
│   │              │  │              │  │              │             │
│   │ - email      │  │ - code       │  │ - period     │             │
│   │ - password   │  │ - name       │  │ - meter      │             │
│   │ - role       │  │ - category   │  │ - amount     │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │ Revenue      │  │ ForecastResult│ │ModelPerform  │             │
│   │ (MAIN TABLE) │  │              │  │              │             │
│   │              │  │ - predicted  │  │ - mae        │             │
│   │ - period     │  │ - bounds     │  │ - mape       │             │
│   │ - revenue    │  │ - confidence │  │ - rmse       │             │
│   │ - type       │  │ - features   │  │ - r2         │             │
│   │ - accuracy   │  │              │  │              │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
└──────────────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTP POST
┌─────────────────────────┴──────────────────────────────────────────┐
│ 🤖 EXTERNAL ML MODEL (Python - Friend's Code)                      │
│                                                                    │
│   Historical Data ──┐                                              │
│   Consumption Data  ├─→ [Model Training]                           │
│   Revenue Data ─────┘                                              │
│                           ↓                                        │
│                   [Generate Forecast]                              │
│                           ↓                                        │
│   Output:                                                          │
│   - predicted_revenue                                              │
│   - confidence_bounds                                              │
│   - accuracy_metrics                                               │
│                           ↓                                        │
│                   POST /api/forecast                               │
│                   + x-api-key header                               │
│                                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagram

### Monthly Forecasting Process

```
┌─────────────────────────────────────────────────────────┐
│ MONTH END (e.g., Last day of January)                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Python Model Starts │
        │ (Cron Job)          │
        └─────────┬───────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ Fetch historical data       │
    │ GET /api/revenues?limit=24  │
    └─────────────┬───────────────┘
                  │
            ▼─────┴─────▼
      ┌────────────────────────┐
      │ Last 6+ months data:   │
      │ • Period               │
      │ • Total Customers      │
      │ • Consumption (m³)     │
      │ • Revenue (Rp)         │
      └────────┬───────────────┘
               │
               ▼
      ┌──────────────────────┐
      │ Feature Engineering: │
      │ • Trends             │
      │ • Seasonality        │
      │ • Lag features       │
      │ • Moving averages    │
      └────────┬─────────────┘
               │
               ▼
      ┌──────────────────────┐
      │ Train ML Model       │
      │ (RandomForest/etc)   │
      └────────┬─────────────┘
               │
               ▼
      ┌──────────────────────────────┐
      │ Generate Forecast:           │
      │ • Predicted Revenue for      │
      │   next month (Feb 1st)       │
      │ • Confidence Interval        │
      │ • Confidence %               │
      │ • Accuracy Metrics (MAPE)    │
      └────────┬─────────────────────┘
               │
               ▼
      ┌──────────────────────────────┐
      │ POST /api/forecast           │
      │                              │
      │ Headers:                     │
      │ - x-api-key: SECRET_KEY      │
      │ - Content-Type: application  │
      │                              │
      │ Body:                        │
      │ {                            │
      │   period: "2024-02-01",      │
      │   predictedRevenue: 1.6B,    │
      │   lowerBound: 1.55B,         │
      │   upperBound: 1.65B,         │
      │   confidence: 95.5,          │
      │   modelVersion: "v1.0",      │
      │   ...                        │
      │ }                            │
      └────────┬─────────────────────┘
               │
               ▼
    ┌────────────────────────────────┐
    │ Next.js API Handler            │
    │ /api/forecast (POST)           │
    │                                │
    │ 1. Validate API key            │
    │ 2. Parse request body          │
    │ 3. Save to ForecastResult      │
    │ 4. Save to Revenue (FORECAST)  │
    │ 5. Save to ModelPerformance    │
    │ 6. Return success              │
    └────────┬───────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ PostgreSQL Database Update:      │
    │                                  │
    │ ForecastResult table:            │
    │ ├─ predictedRevenue: 1.6B        │
    │ ├─ bounds: [1.55B, 1.65B]        │
    │ └─ features: { ... }             │
    │                                  │
    │ Revenue table (FORECAST type):   │
    │ ├─ period: 2024-02-01            │
    │ ├─ revenue: 1.6B                 │
    │ ├─ type: FORECAST                │
    │ └─ accuracy: 95.5                │
    │                                  │
    │ ModelPerformance table:          │
    │ ├─ mae: 50M                      │
    │ ├─ mape: 3.2                     │
    │ └─ rmse: 75M                     │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Frontend Auto-Refresh            │
    │ (User opens dashboard)           │
    │                                  │
    │ 1. getDashboardData() fetches    │
    │    latest data from database     │
    │ 2. Charts update with forecast   │
    │ 3. Stats cards show new values   │
    │ 4. Table shows new forecast row  │
    └──────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ✅ PROCESS COMPLETE                             │
│                                                  │
│ Managers can now:                               │
│ • View forecast for next month                  │
│ • Compare with actual revenue                   │
│ • Make business decisions based on prediction   │
└─────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy

```
┌─────────────────────────────────────────────────┐
│         Dashboard (app/page.js)                 │
│                                                 │
│         Server Component:                       │
│         • getDashboardData()                    │
│         • Fetch from Prisma                     │
│         • Pass props to children                │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
    ┌────────┐  ┌────────┐  ┌───────────┐  ┌────────┐
    │ Header │  │ Stats  │  │ Revenue   │  │ Distrib│
    │        │  │ Cards  │  │ Chart     │  │ution   │
    │ .js    │  │ .js    │  │ .js       │  │ .js    │
    └────────┘  └────────┘  └───────────┘  └────────┘
                │
                │ Same data
                │ (revenues array)
                │
                ▼
            ┌────────────┐
            │  Revenue   │
            │  Table.js  │
            └────────────┘
```

---

## 4. Database Relationship Diagram

```
┌──────────────────────┐
│      User            │
├──────────────────────┤
│ PK: id               │
│ • email (unique)     │
│ • name               │
│ • role               │
│ • password           │
└──────────────────────┘

┌──────────────────────────────────┐
│      Customer                    │
├──────────────────────────────────┤
│ PK: id                           │
│ • customerCode (unique)          │
│ • name                           │
│ • category (enum)                │
│ • isActive                       │
│                                  │
│ Relations:                       │
│ → consumptions[] (1 to many)     │
│ → revenues[] (1 to many)         │
└────────────┬─────────────────────┘
             │
             │ FK: customerId
             │
    ┌────────┴──────────────┐
    │                       │
    ▼                       ▼
┌───────────────────┐  ┌──────────────────┐
│ Consumption       │  │ Revenue          │
├───────────────────┤  ├──────────────────┤
│ PK: id            │  │ PK: id           │
│ FK: customerId    │  │ FK: customerId   │
│ • period          │  │ • period         │
│ • meterStart      │  │ • revenue        │
│ • meterEnd        │  │ • type (enum)    │
│ • consumption     │  │ • accuracy       │
│                   │  │                  │
│ (Water usage)     │  │ (ACTUAL or       │
│                   │  │  FORECAST)       │
└───────────────────┘  └──────────────────┘

   Note:
   - Consumption table tracks WATER USAGE
   - Revenue table tracks MONEY EARNED
   - Both organized by customer & period
```

---

## 5. State Management Flow

```
┌─────────────────────────────────────────────────┐
│ getDashboardData() in app/page.js              │
│ (Runs on SERVER)                               │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┼──────────────┬────────────┐
    │             │              │            │
    ▼             ▼              ▼            ▼
┌─────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐
│revenues │  │customers   │  │stats       │  │customersByCategory│
│array    │  │array       │  │object      │  │array           │
│         │  │            │  │            │  │                │
│[        │  │[           │  │{           │  │[              │
│  {      │  │  {         │  │  total...: │  │  {            │
│   id,   │  │   id,      │  │  current..│  │    category,  │
│   period│  │   name,    │  │  next...,  │  │    _count     │
│   revenue│  │   category │  │  accuracy  │  │  },           │
│   type  │  │  }         │  │}           │  │  ...          │
│  }      │  │]           │  │            │  │]              │
│]        │  │            │  │            │  │                │
└────┬────┘  └────────────┘  └────────────┘  └──────┬─────────┘
     │                                               │
     └───────────────────┬───────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ Pass as Props to Components        │
        │ (Client receives via serialization)│
        └────┬───────────────────────────────┘
             │
    ┌────────┼────────────┬──────────────────┐
    │        │            │                  │
    ▼        ▼            ▼                  ▼
  Stats    Revenue    Customer      Revenue
  Cards    Chart      Distribution   Table

  Props:    Props:     Props:         Props:
  stats     revenues   distribution   revenues
```

---

## 6. API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SENDING FORECAST DATA                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐
│ Python Code │
│             │
│ forecast = {
│   "period": "2024-02-01",
│   "predictedRevenue": 1500000000,
│   "lowerBound": 1450000000,
│   "upperBound": 1550000000,
│   "confidence": 95.5,
│   "modelVersion": "v1.0",
│   "features": {...},
│   "totalCustomers": 1250,
│   "totalConsumption": 5000
│ }
│
│ requests.post(
│   "http://localhost:3000/api/forecast",
│   headers={"x-api-key": "SECRET"},
│   json=forecast
│ )
└────────────┬────────────────────────────────────────────────┘
             │ HTTP POST
             │ Header: x-api-key: SECRET
             │ Body: JSON
             ▼
┌──────────────────────────────────────────────────────────────┐
│ /api/forecast route.js                                       │
│                                                              │
│ export async function POST(request) {                       │
│   const apiKey = request.headers.get('x-api-key')           │
│   if (apiKey !== process.env.ML_MODEL_API_KEY)              │
│     return 401 Unauthorized                                 │
│                                                              │
│   const body = await request.json()                         │
│                                                              │
│   // Save to ForecastResult table                           │
│   const result = await prisma.forecastResult.create({      │
│     data: {                                                 │
│       period: new Date(body.period),                        │
│       predictedRevenue: body.predictedRevenue,              │
│       ...                                                   │
│     }                                                       │
│   })                                                        │
│                                                              │
│   // Also save to Revenue table                             │
│   await prisma.revenue.create({                            │
│     data: {                                                 │
│       period: ...,                                          │
│       revenue: body.predictedRevenue,                       │
│       type: 'FORECAST',                                     │
│       ...                                                   │
│     }                                                       │
│   })                                                        │
│                                                              │
│   return { success: true, data: result }                    │
│ }                                                           │
└────────────┬───────────────────────────────────────────────┘
             │ HTTP 200 OK
             │ Body: JSON response
             ▼
┌───────────────────┐
│ Python Code       │
│                   │
│ response.json()   │
│ {                 │
│   "success": true,│
│   "data": {       │
│     "id": "...",  │
│     "period": ...,│
│     ...           │
│   }               │
│ }                 │
└───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DATABASE UPDATES (Automatically)                            │
└─────────────────────────────────────────────────────────────┘

Before:
┌──────────────────────────────────────────┐
│ ForecastResult table                     │
├──────────────────────────────────────────┤
│ (existing records from previous months)  │
│ id: cuid_001, period: 2024-01-01, ...    │
│ id: cuid_002, period: 2023-12-01, ...    │
└──────────────────────────────────────────┘

After:
┌──────────────────────────────────────────┐
│ ForecastResult table                     │
├──────────────────────────────────────────┤
│ id: cuid_001, period: 2024-01-01, ...    │
│ id: cuid_002, period: 2023-12-01, ...    │
│ id: cuid_003, period: 2024-02-01, ...  ◄─ NEW!
│ (with predictedRevenue, bounds, etc)     │
└──────────────────────────────────────────┘

Similarly, Revenue table:
┌──────────────────────────────────────────┐
│ Revenue table                            │
├──────────────────────────────────────────┤
│ type: ACTUAL, period: 2024-01-01, ...    │
│ type: FORECAST, period: 2024-02-01, ...◄─ NEW!
└──────────────────────────────────────────┘
```

---

## 7. Frontend Data Refresh Cycle

```
┌────────────────────────────────┐
│ User opens http://localhost:3000
└────────────────┬───────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Browser requests /       │
    │ (Next.js App Router)     │
    └────────┬─────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ page.js getDashboardData()          │
│ (Server Component)                  │
│                                     │
│ • Queries Prisma                    │
│ • Gets latest Revenue records       │
│ • (includes new FORECAST if posted) │
│ • Aggregates customer counts        │
│ • Calculates stats                  │
└────────┬────────────────────────────┘
         │ Returns props
         ▼
┌─────────────────────────────────┐
│ Components render with new data │
│                                 │
│ <DashboardStats stats={data} /> │
│ ├─ Shows forecast value         │
│ └─ % change updated             │
│                                 │
│ <RevenueChart revenues={data}/> │
│ └─ New forecast line added      │
│                                 │
│ <RevenueTable revenues={data}/> │
│ └─ New row visible              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ HTML sent to browser        │
│ Browser renders UI          │
│ ✅ Dashboard updated!       │
└─────────────────────────────┘
```

---

## 8. Error Handling Flow

```
┌─────────────────────────────────┐
│ Python sends forecast to API    │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ /api/forecast (POST)
    └────┬───────────────┘
         │
    ┌────┴─────────────┐
    │                  │
    ▼                  ▼
  ✅ Valid         ❌ Invalid
  API Key            API Key
    │                  │
    │                  ▼
    │          Return 401:
    │          {
    │            success: false,
    │            error: "Unauthorized"
    │          }
    │
    ▼
  Validate
  Request
  Body
    │
    ├─ ✅ All required fields present
    │      ↓
    │   Save to database ──→ Success 200
    │
    └─ ❌ Missing/Invalid fields
         ↓
      Return 400:
      {
        success: false,
        error: "Invalid request"
      }
```

---

## 9. Tailwind CSS Grid System

```
┌────────────────────────────────────────────────────────────────┐
│ Desktop (lg): 4 columns                                        │
│ ┌──────────┬──────────┬──────────┬──────────┐                 │
│ │ Stats 1  │ Stats 2  │ Stats 3  │ Stats 4  │                 │
│ ├──────────┼──────────┼──────────┼──────────┤                 │
│ │       Revenue Chart (spans 3 cols)       │ Distribution (1) │
│ ├──────────────────────────────────────────┼──────────────────┤
│ │              Revenue Table (spans all)                      │
│ └──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Tablet (md): 2 columns                                         │
│ ┌──────────┬──────────┐                                        │
│ │ Stats 1  │ Stats 2  │                                        │
│ ├──────────┼──────────┤                                        │
│ │ Stats 3  │ Stats 4  │                                        │
│ ├──────────┼──────────┤                                        │
│ │ Revenue Chart (spans both)               │                  │
│ ├──────────┴──────────┤                                        │
│ │ Distribution (spans)│                                        │
│ ├──────────┴──────────┤                                        │
│ │ Revenue Table       │                                        │
│ └─────────────────────┘                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Mobile: 1 column                                               │
│ ┌──────────────────────────────────────────┐                  │
│ │ Stats 1                                  │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Stats 2                                  │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Stats 3                                  │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Stats 4                                  │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Revenue Chart                            │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Distribution                             │                  │
│ ├──────────────────────────────────────────┤                  │
│ │ Revenue Table                            │                  │
│ └──────────────────────────────────────────┘                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

CSS Classes Used:
- grid-cols-1          → 1 column (mobile)
- md:grid-cols-2       → 2 columns (tablet)
- lg:grid-cols-4       → 4 columns (desktop)
- gap-5, gap-6         → Space between items
- mb-8                 → Bottom margin
```

---

## 10. Event Timeline (Chronological)

```
Timeline of Revenue Data & Forecasts:

┌─────────────────────────────────────────────────────────────────┐
│ November 2023                                                   │
│ └─ ACTUAL revenue received at end of month                      │
│    Data stored: type='ACTUAL', period='2023-11-01'             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ December 2023                                                   │
│ └─ ACTUAL revenue received at end of month                      │
│    Data stored: type='ACTUAL', period='2023-12-01'             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ January 2024                                                    │
│ ├─ ACTUAL revenue received at end of month                      │
│ │  Data stored: type='ACTUAL', period='2024-01-01'             │
│ │                                                                │
│ └─ End of January: Python model runs                            │
│    • Fetches last 6+ months ACTUAL data                         │
│    • Trains model                                               │
│    • Generates forecast for February                            │
│    • POST /api/forecast with prediction                         │
│    • Data stored: type='FORECAST', period='2024-02-01'         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ February 2024                                                   │
│ ├─ FORECAST visible on dashboard (from Jan 31 prediction)       │
│ │  • Chart shows dashed orange line                             │
│ │  • Stats card shows "Forecast Bulan Depan"                    │
│ │  • Table shows "Forecast" row                                 │
│ │                                                                │
│ └─ ACTUAL revenue received at end of month                      │
│    • Can compare: Forecast (Feb 1) vs Actual (Feb 28)          │
│    • Calculate forecast accuracy                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ March 2024                                                      │
│ ├─ ACTUAL revenue received at end of month                      │
│ │  Data stored: type='ACTUAL', period='2024-03-01'             │
│ │                                                                │
│ └─ End of February: Python model runs again                     │
│    • Fetches 6+ months including Feb actual                     │
│    • Retrains model with new data                               │
│    • Generates forecast for March                               │
│    • POST /api/forecast                                         │
│    • Data stored: type='FORECAST', period='2024-03-01'         │
└─────────────────────────────────────────────────────────────────┘

...and so on, every month!

Dashboard View at "February 2024":
┌──────────────────────────────────────┐
│ Historical Data (Solid Blue Line)    │
│ ├─ Nov: Rp 1.4M (ACTUAL)             │
│ ├─ Dec: Rp 1.5M (ACTUAL)             │
│ ├─ Jan: Rp 1.5M (ACTUAL)             │
│ │                                     │
│ Forecast Data (Dashed Orange Line)    │
│ └─ Feb: Rp 1.6M (FORECAST)           │
└──────────────────────────────────────┘
```

---

These diagrams help visualize:

- ✅ Overall architecture
- ✅ Data flow from Python to database
- ✅ Component hierarchy
- ✅ Database relationships
- ✅ API communication
- ✅ Frontend updates
- ✅ Error handling
- ✅ Responsive design
- ✅ Timeline of data

Gunakan diagrams ini untuk menjelaskan kepada teman Anda bagaimana sistem bekerja! 🚀
