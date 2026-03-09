# 🎨 Components Deep Dive

Dokumentasi lengkap untuk setiap component di aplikasi PTAM Forecasting.

---

## 📦 File & Import Structure

```
/components
├── DashboardStats.js      // KPI Stats Cards
├── RevenueChart.js        // Line Chart: Actual vs Forecast
├── CustomerDistribution.js // Doughnut Chart: Customer by Category
├── RevenueTable.js        // Data Table: Revenue Details
├── Header.js              // Navigation & Branding
└── All components imported in app/page.js
```

---

## 1️⃣ DashboardStats.js - KPI Cards

### Purpose

Menampilkan 4 kartu utama dengan metrik penting dashboard.

### Props

```javascript
stats: {
  totalCustomers: number,          // Total pelanggan aktif
  currentMonthRevenue: {           // Revenue terbaru (ACTUAL)
    revenue: number,
    period: Date
  },
  nextMonthForecast: {            // Forecast terbaru (FORECAST)
    revenue: number,
    period: Date
  },
  modelAccuracy: number            // Dari ModelPerformance.mape
}
```

### Struktur Component

```javascript
export default function DashboardStats({ stats }) {
  // Utility functions
  const formatCurrency = (amount) => {
    return `Rp ${(amount / 1000000).toFixed(1)}M`; // Ubah ke juta Rp
  };

  const calculateChange = (current, previous) => {
    return (((current - previous) / previous) * 100).toFixed(1); // % perubahan
  };

  // Extract data
  const currentRevenue = stats.currentMonthRevenue?.revenue || 0;
  const forecastRevenue = stats.nextMonthForecast?.revenue || 0;
  const forecastChange = calculateChange(forecastRevenue, currentRevenue);

  // Render 4 cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Pendapatan Bulan Ini */}
      {/* Card 2: Forecast Bulan Depan */}
      {/* Card 3: Total Pelanggan */}
      {/* Card 4: Akurasi Model */}
    </div>
  );
}
```

### Key Features

**1. Responsive Grid:**

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

**2. Card Design:**

- White background dengan shadow
- Border-left 4px dengan warna theme
- Hover effect: shadow meningkat

**3. Card Components:**

```
┌────────────────────────┐
│ Label (gray) | Icon    │  <- Header
│ Value (bold)           │  <- Big number
│ Subtitle (green)       │  <- Meta info
└────────────────────────┘
```

**4. Currency Formatting:**

- Input: 1500000000 (IDR)
- Output: "Rp 1.5M"
- Formula: `(amount / 1000000).toFixed(1)`

**5. Change Calculation:**

- Bandingkan forecast vs actual
- Formula: `((current - previous) / previous) * 100`
- Contoh: Forecast 1.6M vs Actual 1.5M = +6.7%

### Color Theme

| Card                 | Color          | Border  | Emoji |
| -------------------- | -------------- | ------- | ----- |
| Pendapatan Bulan Ini | Primary Blue   | primary | 💰    |
| Forecast Bulan Depan | Success Green  | success | 📈    |
| Total Pelanggan      | Warning Orange | warning | 👥    |
| Akurasi Model        | Accent Purple  | accent  | 🎯    |

### Example Data Flow

```javascript
// Data dari page.js getDashboardData()
const stats = {
  totalCustomers: 1250,
  currentMonthRevenue: {
    revenue: 1500000000,
    period: "2024-01-31",
  },
  nextMonthForecast: {
    revenue: 1600000000,
    period: "2024-02-28",
  },
  modelAccuracy: 96.8, // 100 - MAPE
};

// DashboardStats render:
// Card 1: Rp 1.5M (dari current)
// Card 2: Rp 1.6M (+6.7% forecast)
// Card 3: 1,250 (total customers)
// Card 4: 96.8% (model accuracy)
```

---

## 2️⃣ RevenueChart.js - Line Chart

### Purpose

Visualisasi trend pendapatan actual vs forecast dalam bentuk line chart.

### Props

```javascript
revenues: Array<{
  id: string,
  period: Date,
  revenue: number,
  type: 'ACTUAL' | 'FORECAST',
  totalCustomers: number,
  totalConsumption: number,
  accuracy?: number,
  confidenceLevel?: number,
  customer?: {
    id: string,
    name: string,
    category: string
  }
}>
```

### Key Components

**1. Data Processing:**

```javascript
// Sort by period (oldest → newest)
const sortedRevenues = [...revenues].sort(
  (a, b) => new Date(a.period) - new Date(b.period),
);

// Prepare labels
const labels = sortedRevenues.map((r) =>
  format(new Date(r.period), "MMM yyyy", { locale: id }),
);
// Output: ['Jan 2024', 'Feb 2024', ...]

// Separate datasets
const actualData = sortedRevenues.map(
  (r) => (r.type === "ACTUAL" ? r.revenue : null), // null untuk forecast
);

const forecastData = sortedRevenues.map(
  (r) => (r.type === "FORECAST" ? r.revenue : null), // null untuk actual
);
```

**2. Chart Configuration:**

```javascript
const data = {
  labels: ['Jan 2024', 'Feb 2024', ...],
  datasets: [
    {
      label: 'Pendapatan Aktual',
      data: [1500000000, 1600000000, null, ...],
      borderColor: '#0077BE',        // Blue
      backgroundColor: 'rgba(0, 119, 190, 0.1)',
      borderWidth: 3,
      tension: 0.4,                  // Smooth curve
      fill: true,                    // Area fill
      pointRadius: 5,
      spanGaps: false,               // Don't connect null values
    },
    {
      label: 'Forecast',
      data: [null, null, 1700000000, ...],
      borderColor: '#FF6B35',        // Orange
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      borderDash: [5, 5],            // Dashed line
      // ... same config as above
    }
  ]
}
```

**3. Chart Options:**

```javascript
const options = {
  responsive: true, // Responsive to container
  maintainAspectRatio: true,
  aspectRatio: 2, // Width:Height = 2:1

  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 20,
        font: { size: 13 },
      },
    },
    tooltip: {
      // Custom format for tooltip
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          if (context.parsed.y !== null) {
            label += ": Rp " + (context.parsed.y / 1000000).toFixed(1) + "M";
          }
          return label;
        },
      },
    },
  },

  scales: {
    y: {
      ticks: {
        // Format Y-axis as Rp XXM
        callback: function (value) {
          return "Rp " + value / 1000000 + "M";
        },
      },
    },
  },
};
```

### Visual Structure

```
┌─────────────────────────────────────────┐
│ Tren Pendapatan & Forecasting           │
│            [6 Bulan] [1 Tahun]         │
│                                         │
│  M ┤                                     │
│  i │     ACTUAL (blue)                  │
│  l │   ╱───╲    ╱──                     │
│  l │  ╱     ╲  ╱   FORECAST (orange)    │
│  i │ ╱       ╲╱───╲                     │
│  a │╱            ╲  ╲                   │
│  n │              ╲  ╲╱─────            │
│    └────────────────────────────        │
│    Jan Feb Mar Apr May Jun              │
│                                         │
│ ◼ Pendapatan Aktual  ◼ Forecast         │
└─────────────────────────────────────────┘
```

### Features

1. **Dual Dataset:**
   - Actual: Solid blue line
   - Forecast: Dashed orange line

2. **Interactive:**
   - Hover untuk tooltip
   - Click legend untuk toggle visibility

3. **Responsive:**
   - Scales ke container width
   - Mobile-friendly

4. **Date Formatting:**
   - Menggunakan date-fns dengan locale Indonesia
   - Format: "Jan 2024" (short)

### Example Data

```javascript
revenues = [
  {
    period: "2024-01-01",
    revenue: 1500000000,
    type: "ACTUAL",
    totalCustomers: 1200,
    totalConsumption: 4800,
  },
  {
    period: "2024-02-01",
    revenue: 1600000000,
    type: "ACTUAL",
    totalCustomers: 1220,
    totalConsumption: 5000,
  },
  {
    period: "2024-03-01",
    revenue: 1700000000,
    type: "FORECAST",
    totalCustomers: 1250,
    totalConsumption: 5200,
  },
];

// Chart output:
// Jan: blue dot at 1500M
// Feb: blue dot at 1600M
// Mar: orange dot at 1700M (dashed line from Feb)
```

---

## 3️⃣ CustomerDistribution.js - Doughnut Chart

### Purpose

Tampilkan breakdown pelanggan berdasarkan kategori dalam doughnut chart.

### Props

```javascript
distribution: Array<{
  category: 'RUMAH_TANGGA' | 'KOMERSIAL' | 'INDUSTRI' | 'SOSIAL',
  _count: number  // Jumlah pelanggan di kategori ini
}>
```

### Structure

```javascript
// Category mapping
const categoryLabels = {
  RUMAH_TANGGA: "Rumah Tangga",
  KOMERSIAL: "Komersial",
  INDUSTRI: "Industri",
  SOSIAL: "Sosial",
};

// Process data
const labels = distribution.map((d) => categoryLabels[d.category]);
// Output: ['Rumah Tangga', 'Komersial', 'Industri', 'Sosial']

const counts = distribution.map((d) => d._count);
// Output: [700, 300, 150, 100]
```

### Chart Configuration

```javascript
const data = {
  labels: ["Rumah Tangga", "Komersial", "Industri", "Sosial"],
  datasets: [
    {
      data: [700, 300, 150, 100],
      backgroundColor: [
        "#0077BE", // Dark blue
        "#00A3E0", // Light blue
        "#FF6B35", // Orange
        "#06D6A0", // Green
      ],
      borderWidth: 0,
      hoverOffset: 10, // Expand slice on hover
    },
  ],
};

const options = {
  responsive: true,
  aspectRatio: 1.2, // Square-ish
  plugins: {
    tooltip: {
      // Show percentage in tooltip
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return (
            context.label + ": " + context.parsed + " (" + percentage + "%)"
          );
        },
      },
    },
  },
};
```

### Visual Representation

```
        ┌─────────────────┐
        │ Distribusi Pelanggan
        │
        │    Rumah Tangga: 700 (58%)
        │       ▼
        │    ╭─────────╮
        │   ╱   Blue    ╲
        │  │   58%       │
        │   ╲           ╱
        │    ╰─────────╯ Green: 100 (8%)
        │
        │ Orange: 150 (12%)  LightBlue: 300 (22%)
        └─────────────────┘
```

### Features

1. **Color-coded:**
   - Rumah Tangga: Dark Blue
   - Komersial: Light Blue
   - Industri: Orange
   - Sosial: Green

2. **Hover Effect:**
   - Slice expands (hoverOffset: 10)
   - Tooltip shows percentage

3. **Responsive:**
   - Scales dengan container
   - Legend di bottom

### Example Data

```javascript
distribution = [
  { category: "RUMAH_TANGGA", _count: 700 },
  { category: "KOMERSIAL", _count: 300 },
  { category: "INDUSTRI", _count: 150 },
  { category: "SOSIAL", _count: 100 },
];

// Total: 1250 customers
// Chart output:
// Rumah Tangga: 58%
// Komersial: 24%
// Industri: 12%
// Sosial: 8%
```

---

## 4️⃣ RevenueTable.js - Data Table

### Purpose

Tampilkan revenue data dalam format tabel dengan search & export functionality.

### Props

```javascript
revenues: Array<Revenue>  // Same as RevenueChart component
```

### Structure

```javascript
// Sort descending & take top 5
const sortedRevenues = [...revenues]
  .sort((a, b) => new Date(b.period) - new Date(a.period))
  .slice(0, 5);

// Map to table rows
sortedRevenues.map((revenue) => (
  <tr key={revenue.id}>
    <td>{format(new Date(revenue.period), "MMMM yyyy")}</td>
    <td>{revenue.totalCustomers.toLocaleString()}</td>
    <td>{revenue.totalConsumption.toLocaleString()} m³</td>
    <td>Rp {(revenue.revenue / 1000000).toFixed(1)}M</td>
    <td>{revenue.type === "ACTUAL" ? "Aktual" : "Forecast"}</td>
    <td>{revenue.accuracy?.toFixed(1)}%</td>
  </tr>
));
```

### Table Columns

| Column          | Format                  | Example                 |
| --------------- | ----------------------- | ----------------------- |
| Periode         | MMMM yyyy               | "Januari 2024"          |
| Total Pelanggan | Number with thousands   | "1,250"                 |
| Konsumsi (m³)   | Number with thousands   | "5,000 m³"              |
| Pendapatan      | Currency                | "Rp 1.5M"               |
| Tipe            | Badge (ACTUAL/FORECAST) | `[Aktual]` `[Forecast]` |
| Akurasi         | Percentage              | "95.5%"                 |

### Visual Structure

```
┌────────────────────────────────────────────────────────────────┐
│ Data Pendapatan Detail          🔍 Cari | [📥 Export]        │
├────────────────────────────────────────────────────────────────┤
│ Periode        │ Pelanggan │ Konsumsi │ Pendapatan │ Tipe │ Akurasi │
├────────────────────────────────────────────────────────────────┤
│ Januari 2024   │ 1,250     │ 5,000 m³ │ Rp 1.5M    │ Aktual   │ 95.5% │
│ Februari 2024  │ 1,220     │ 4,900 m³ │ Rp 1.6M    │ Aktual   │ 96.2% │
│ Maret 2024     │ 1,250     │ 5,200 m³ │ Rp 1.7M    │ Forecast │ -     │
│ April 2024     │ 1,300     │ 5,500 m³ │ Rp 1.8M    │ Forecast │ -     │
│ Mei 2024       │ 1,350     │ 5,800 m³ │ Rp 1.9M    │ Forecast │ -     │
└────────────────────────────────────────────────────────────────┘
```

### Type Badge Styling

```javascript
<span
  className={`
  inline-flex px-3 py-1 text-xs font-semibold rounded-full
  ${
    revenue.type === "ACTUAL"
      ? "bg-blue-100 text-blue-800" // Light blue background
      : "bg-orange-100 text-orange-800" // Light orange background
  }
`}
>
  {revenue.type === "ACTUAL" ? "Aktual" : "Forecast"}
</span>
```

### Features

1. **Sorting:**
   - Default: Newest first
   - Take top 5 records

2. **Search Box:**
   - Placeholder: "Cari data..."
   - (Functionality dapat diimplementasikan)

3. **Export Button:**
   - Icon: 📥
   - (Functionality dapat diimplementasikan untuk CSV/Excel)

4. **Hover Effect:**
   - Row background berubah ke gray-50
   - Smooth transition

5. **Responsive:**
   - overflow-x-auto untuk mobile
   - Scrollable di device kecil

### Example Data

```javascript
revenues = [
  {
    id: "cuid123",
    period: "2024-01-01",
    totalCustomers: 1250,
    totalConsumption: 5000,
    revenue: 1500000000,
    type: "ACTUAL",
    accuracy: 95.5,
  },
  // ... more records
];

// Table render:
// Row 1: Jan 2024 | 1,250 | 5,000 m³ | Rp 1.5M | Aktual | 95.5%
// Row 2: Feb 2024 | 1,220 | 4,900 m³ | Rp 1.6M | Aktual | 96.2%
// ... (max 5 rows)
```

---

## 5️⃣ Header.js - Navigation

### Purpose

Menampilkan branding dan navigation header.

### Typical Usage

```javascript
<Header />
```

### Common Implementation

```javascript
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
              💧
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              PTAM Forecasting
            </h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin User</span>
            <button className="px-4 py-2 bg-gray-100 rounded-lg">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 🔄 Component Flow in page.js

```javascript
// app/page.js
async function getDashboardData() {
  // Fetch all data from Prisma
  const revenues = await prisma.revenue.findMany(...)
  const customersByCategory = await prisma.customer.groupBy(...)
  // ... etc

  return {
    revenues,
    customersByCategory,
    stats: { ... }
  }
}

export default function Dashboard() {
  const data = getDashboardData()

  return (
    <>
      <Header />
      <main className="p-6">
        {/* Stats Cards */}
        <DashboardStats stats={data.stats} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart revenues={data.revenues} />
          <CustomerDistribution distribution={data.customersByCategory} />
        </div>

        {/* Data Table */}
        <RevenueTable revenues={data.revenues} />
      </main>
    </>
  )
}
```

### Data Flow Diagram

```
┌─────────────────────────────────────┐
│   page.js getDashboardData()        │
│   - Query Prisma database           │
│   - Aggregate data                  │
│   - Return structured data          │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┬─────────────┬──────────────┐
        │                 │             │              │
        ▼                 ▼             ▼              ▼
    DashboardStats   RevenueChart  CustomerDistribution RevenueTable
    - KPI Cards      - Line Chart   - Doughnut Chart    - Data Table
    - Actual vs      - Actual vs    - Category          - Last 5
      Forecast         Forecast       breakdown          records
```

---

## 🎨 Styling Recap

### Colors Used

```javascript
// Primary Colors (from Tailwind)
--primary: #0077BE       // Dark Blue
--success: #06D6A0       // Green
--warning: #FFA500       // Orange
--accent: #7C3AED        // Purple

// Specific Chart Colors
--chart-actual: #0077BE        // Dark Blue
--chart-forecast: #FF6B35      // Orange
--chart-customer-1: #0077BE    // Dark Blue
--chart-customer-2: #00A3E0    // Light Blue
--chart-customer-3: #FF6B35    // Orange
--chart-customer-4: #06D6A0    // Green
```

### Common Classes

```css
/* Typography */
text-xs, text-sm, text-base, text-lg, text-xl, text-3xl
font-light, font-normal, font-semibold, font-bold

/* Spacing */
p-4, p-6, p-7      /* Padding */
gap-2, gap-3, gap-4, gap-5, gap-6  /* Grid/Flex gap */
mb-3, mb-6, mb-8   /* Margin bottom */

/* Backgrounds */
bg-white, bg-gray-50, bg-gray-100
bg-primary, bg-success, bg-warning, bg-accent
bg-opacity-10      /* Semi-transparent */

/* Borders */
border, border-l-4, border-b
border-primary, border-gray-200
rounded-lg, rounded-2xl

/* Shadows */
shadow-sm, shadow-md
hover:shadow-md

/* Grid/Layout */
grid-cols-1, md:grid-cols-2, lg:grid-cols-4
flex, flex-col, flex-row, justify-between, items-center
```

---

## 📝 Summary

| Component                | Purpose        | Key Features                                   | Data Type          |
| ------------------------ | -------------- | ---------------------------------------------- | ------------------ |
| **DashboardStats**       | KPI Cards      | Responsive grid, currency formatting, % change | stats object       |
| **RevenueChart**         | Line Chart     | Dual dataset, interactive, date formatting     | revenues array     |
| **CustomerDistribution** | Doughnut Chart | Color-coded, hover effects, percentage         | distribution array |
| **RevenueTable**         | Data Table     | Sortable, searchable, export ready             | revenues array     |
| **Header**               | Navigation     | Branding, user info                            | -                  |

Semua component menggunakan:

- ✅ Tailwind CSS untuk styling
- ✅ Server-side data fetching di page.js
- ✅ Indonesian locale (date-fns)
- ✅ Currency formatting (Rupiah)
- ✅ Responsive design
- ✅ Interactive charts (Chart.js)
