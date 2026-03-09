# 🔌 Integration Guide - Python ML Model ke Next.js Dashboard

## Persiapan Integrasi

### 1. Setup Environment Variables

Update file `.env` di root project:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ptam_forecasting"

# ML Model Security
ML_MODEL_API_KEY="your-secret-api-key-here"

# ML Model Endpoint (jika model berjalan di machine lain)
ML_MODEL_ENDPOINT="http://localhost:5000"
```

### 2. Verifikasi API Endpoint Siap

Test POST endpoint dengan curl:

```bash
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "period": "2024-02-01",
    "predictedRevenue": 1500000000,
    "lowerBound": 1450000000,
    "upperBound": 1550000000,
    "confidence": 95.5,
    "modelVersion": "v1.0",
    "features": {"trend": "upward", "seasonality": 1.2},
    "totalCustomers": 1250,
    "totalConsumption": 5000
  }'
```

---

## Python ML Model Integration Example

### A. Setup Python Environment

```bash
# Di folder Python model Anda
python -m venv venv
source venv/bin/activate  # atau venv\Scripts\activate di Windows

pip install requests pandas scikit-learn
```

### B. Forecast Script Template

```python
# forecast_model.py
import requests
import json
import os
from datetime import datetime, timedelta
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PTAMForecastModel:
    def __init__(self):
        self.api_endpoint = "http://localhost:3000/api"
        self.api_key = os.getenv("ML_MODEL_API_KEY", "your-secret-key")
        self.model = RandomForestRegressor(n_estimators=100)
        self.model_version = "v1.0"

    def fetch_historical_data(self):
        """Fetch 6+ bulan data dari dashboard"""
        try:
            headers = {"x-api-key": self.api_key}
            response = requests.get(
                f"{self.api_endpoint}/revenues?limit=12&type=ACTUAL",
                headers=headers
            )
            response.raise_for_status()
            return response.json()['data']
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data: {e}")
            return []

    def prepare_features(self, revenues_data):
        """Convert revenue data menjadi features untuk model"""
        df = pd.DataFrame(revenues_data)
        df['period'] = pd.to_datetime(df['period'])
        df = df.sort_values('period')

        # Create features
        df['month'] = df['period'].dt.month
        df['year'] = df['period'].dt.year
        df['lag_1'] = df['revenue'].shift(1)
        df['lag_3'] = df['revenue'].shift(3)
        df['lag_6'] = df['revenue'].shift(6)
        df['ma_3'] = df['revenue'].rolling(window=3).mean()

        return df.dropna()

    def train_model(self, historical_data):
        """Train forecasting model"""
        logger.info("Preparing features...")
        df = self.prepare_features(historical_data)

        # Features & target
        feature_cols = ['month', 'totalCustomers', 'totalConsumption',
                       'lag_1', 'lag_3', 'lag_6', 'ma_3']
        X = df[feature_cols]
        y = df['revenue']

        logger.info(f"Training model with {len(df)} samples...")
        self.model.fit(X, y)

        # Calculate accuracy
        score = self.model.score(X, y)
        logger.info(f"Model R² Score: {score:.4f}")

        return df, feature_cols

    def predict_next_month(self, latest_data, feature_cols):
        """Predict revenue untuk bulan depan"""
        # Prepare next period features
        last_row = latest_data.iloc[-1:].copy()
        next_month = last_row['period'].iloc[0] + timedelta(days=30)

        # Create feature vector untuk prediksi
        next_features = pd.DataFrame({
            'month': [next_month.month],
            'year': [next_month.year],
            'totalCustomers': [last_row['totalCustomers'].iloc[0]],
            'totalConsumption': [last_row['totalConsumption'].iloc[0]],
            'lag_1': [last_row['revenue'].iloc[0]],
            'lag_3': [latest_data['revenue'].iloc[-3] if len(latest_data) >= 3 else 0],
            'lag_6': [latest_data['revenue'].iloc[-6] if len(latest_data) >= 6 else 0],
            'ma_3': [latest_data['revenue'].iloc[-3:].mean()],
        })

        # Predict
        prediction = self.model.predict(next_features)[0]

        # Calculate confidence interval (±10% for example)
        confidence = 95.0
        margin = prediction * 0.10

        return {
            'period': next_month.isoformat(),
            'predictedRevenue': int(prediction),
            'lowerBound': int(prediction - margin),
            'upperBound': int(prediction + margin),
            'confidence': confidence,
            'totalCustomers': int(last_row['totalCustomers'].iloc[0]),
            'totalConsumption': float(last_row['totalConsumption'].iloc[0]),
            'features': {
                'model_type': 'RandomForest',
                'n_features': len(feature_cols),
                'training_samples': len(latest_data),
                'confidence_margin': '±10%'
            }
        }

    def send_forecast_to_api(self, forecast_data):
        """Send prediction ke Next.js API"""
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            }

            payload = {
                **forecast_data,
                "modelVersion": self.model_version
            }

            logger.info(f"Sending forecast: {payload}")
            response = requests.post(
                f"{self.api_endpoint}/forecast",
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            logger.info(f"✅ Forecast sent successfully!")
            logger.info(f"Response: {response.json()}")
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Error sending forecast: {e}")
            return None

    def run_monthly_forecast(self):
        """Main function to run monthly forecast"""
        logger.info("=" * 50)
        logger.info("Starting monthly forecast generation...")
        logger.info("=" * 50)

        # Step 1: Fetch historical data
        logger.info("\n📥 Step 1: Fetching historical data...")
        historical_data = self.fetch_historical_data()

        if not historical_data:
            logger.error("No historical data found!")
            return

        logger.info(f"✅ Fetched {len(historical_data)} records")

        # Step 2: Train model
        logger.info("\n🤖 Step 2: Training model...")
        df_prepared, feature_cols = self.train_model(historical_data)

        # Step 3: Generate forecast
        logger.info("\n🔮 Step 3: Generating forecast...")
        forecast = self.predict_next_month(df_prepared, feature_cols)

        logger.info(f"""
        Forecast Results:
        - Period: {forecast['period']}
        - Predicted Revenue: Rp {forecast['predictedRevenue']:,}
        - Confidence: {forecast['confidence']}%
        - Range: Rp {forecast['lowerBound']:,} - Rp {forecast['upperBound']:,}
        """)

        # Step 4: Send to API
        logger.info("\n🚀 Step 4: Sending to dashboard...")
        result = self.send_forecast_to_api(forecast)

        if result and result.get('success'):
            logger.info("=" * 50)
            logger.info("✅ FORECAST COMPLETED SUCCESSFULLY!")
            logger.info("=" * 50)
        else:
            logger.error("Failed to send forecast!")


if __name__ == "__main__":
    model = PTAMForecastModel()
    model.run_monthly_forecast()
```

### C. Run Forecast Model

```bash
# Set API key
export ML_MODEL_API_KEY="your-secret-api-key-here"

# Run prediction
python forecast_model.py
```

### D. Schedule Monthly Execution (Cron Job)

#### Linux/Mac:

```bash
# Edit crontab
crontab -e

# Add this line to run every last day of month at 8 AM
0 8 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && cd /path/to/python/model && python forecast_model.py
```

#### Windows (Task Scheduler):

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Monthly, on last day
4. Set action: `python C:\path\to\forecast_model.py`

---

## Data Format Specification

### Request Body ke `/api/forecast`

```json
{
  "period": "2024-02-01", // ISO 8601 date - first day of month
  "predictedRevenue": 1500000000, // Rupiah - integer
  "lowerBound": 1450000000, // Confidence interval lower
  "upperBound": 1550000000, // Confidence interval upper
  "confidence": 95.5, // Percentage (0-100)
  "modelVersion": "v1.0", // Your model version
  "features": {
    // JSON object with any extra data
    "model_type": "RandomForest",
    "training_samples": 24,
    "accuracy_metrics": {
      "mae": 50000000,
      "rmse": 75000000
    }
  },
  "totalCustomers": 1250, // Number of active customers
  "totalConsumption": 5000 // m³ - float
}
```

### Response

**Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cuid123...",
    "period": "2024-02-01T00:00:00.000Z",
    "predictedRevenue": 1500000000,
    "confidence": 95.5,
    "modelVersion": "v1.0",
    "createdAt": "2024-01-30T10:30:00.000Z",
    "updatedAt": "2024-01-30T10:30:00.000Z"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error (500 Server Error):**

```json
{
  "success": false,
  "error": "Failed to save forecast"
}
```

---

## Testing Integration

### 1. Test dengan Postman

**Setup:**

- Method: POST
- URL: `http://localhost:3000/api/forecast`
- Headers:
  ```
  Content-Type: application/json
  x-api-key: your-secret-api-key-here
  ```
- Body (raw JSON):
  ```json
  {
    "period": "2024-02-01",
    "predictedRevenue": 1500000000,
    "lowerBound": 1450000000,
    "upperBound": 1550000000,
    "confidence": 95.5,
    "modelVersion": "v1.0",
    "features": {},
    "totalCustomers": 1250,
    "totalConsumption": 5000
  }
  ```

### 2. Verify Data in Database

```bash
# Connect to PostgreSQL
psql postgresql://username:password@localhost:5432/ptam_forecasting

# Check ForecastResult
SELECT * FROM "ForecastResult" ORDER BY "createdAt" DESC LIMIT 5;

# Check Revenue with type FORECAST
SELECT * FROM "Revenue" WHERE type = 'FORECAST' ORDER BY "createdAt" DESC;
```

### 3. Verify Dashboard Updates

1. Open http://localhost:3000
2. Check "Forecast Bulan Depan" card updated
3. Check RevenueChart shows new forecast line
4. Verify values match what you sent

---

## Troubleshooting

### ❌ API Key Error (401)

**Problem:** "Unauthorized" response

**Solution:**

```bash
# Verify API key matches in:
# 1. Python script
export ML_MODEL_API_KEY="your-secret-api-key-here"

# 2. .env file
ML_MODEL_API_KEY="your-secret-api-key-here"

# 3. Make sure they're EXACTLY the same
```

### ❌ Connection Error

**Problem:** "Cannot connect to localhost:3000"

**Solution:**

```bash
# Ensure Next.js dev server is running
npm run dev

# Should see: "▲ Next.js 14.2.0"
# Ready in: XX.XXXs
# Local: http://localhost:3000
```

### ❌ Database Error

**Problem:** "Failed to save forecast"

**Solution:**

```bash
# 1. Check database connection
psql postgresql://username:password@localhost:5432/ptam_forecasting -c "SELECT 1"

# 2. Verify schema exists
npm run prisma:push

# 3. Check if ForecastResult table exists
psql ... -c "\dt \"ForecastResult\""
```

### ❌ CORS Error (if model runs on different domain)

**Problem:** "CORS policy: no 'Access-Control-Allow-Origin'"

**Solution:** Add CORS header di `/api/forecast`:

```javascript
export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "http://your-python-domain.com",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

---

## Advanced Features (Optional)

### 1. Add Model Performance Tracking

Jika teman Anda juga mengirim metrics:

```python
# Dalam Python model
forecast = {
    # ... existing forecast data
    "modelMetrics": {
        "mae": 45000000,
        "mape": 3.2,
        "rmse": 58000000,
        "r2Score": 0.92
    }
}
```

Kemudian di `/api/forecast` save ke `ModelPerformance` table.

### 2. Add Historical Comparison

```javascript
// Di page.js
const lastForecast = await prisma.revenue.findFirst({
  where: { type: "FORECAST" },
  orderBy: { period: "desc" },
});

const actualOutcome = await prisma.revenue.findFirst({
  where: {
    type: "ACTUAL",
    period: lastForecast.period, // Compare when period happened
  },
});

const forecastAccuracy = {
  predicted: lastForecast.revenue,
  actual: actualOutcome?.revenue,
  error: actualOutcome
    ? ((actualOutcome.revenue - lastForecast.revenue) / lastForecast.revenue) *
      100
    : null,
};
```

### 3. Add Email Notifications

Kirim email saat forecast baru diterima:

```javascript
// Di /api/forecast POST handler
if (forecastResult) {
  await sendEmailNotification({
    to: "manager@ptam.com",
    subject: `New Forecast Generated for ${body.period}`,
    body: `Predicted Revenue: Rp ${body.predictedRevenue}`,
  });
}
```

---

## Summary Checklist

- [ ] Update `.env` dengan `ML_MODEL_API_KEY`
- [ ] Test `/api/forecast` endpoint dengan Postman
- [ ] Setup Python environment dengan dependencies
- [ ] Adapt forecast script untuk model teman Anda
- [ ] Test running forecast script
- [ ] Verify data appears di database
- [ ] Check dashboard updates dengan forecast data
- [ ] Setup cron job untuk monthly execution
- [ ] Monitor logs untuk errors
- [ ] Celebrate! 🎉

---

## Next Steps

1. **Koordinasi dengan teman:**
   - Share `/api/forecast` endpoint specification
   - Share required header: `x-api-key`
   - Share request/response format

2. **Integration testing:**
   - Teman kirim test data ke API
   - Verify data masuk database dengan benar
   - Verify dashboard menampilkan forecast dengan benar

3. **Production deployment:**
   - Deploy Next.js ke server/cloud
   - Update API_ENDPOINT di Python script
   - Setup HTTPS untuk security
   - Monitor daily untuk errors

Good luck! 🚀
