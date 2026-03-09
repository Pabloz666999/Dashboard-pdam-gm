import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API endpoint untuk menerima prediksi dari ML model
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validasi API key jika diperlukan
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.ML_MODEL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Simpan hasil forecast
    const forecastResult = await prisma.forecastResult.create({
      data: {
        period: new Date(body.period),
        predictedRevenue: body.predictedRevenue,
        lowerBound: body.lowerBound,
        upperBound: body.upperBound,
        confidence: body.confidence,
        modelVersion: body.modelVersion,
        features: body.features || {},
      },
    })

    // Simpan juga ke tabel Revenue dengan type FORECAST
    await prisma.revenue.create({
      data: {
        period: new Date(body.period),
        totalCustomers: body.totalCustomers || 0,
        totalConsumption: body.totalConsumption || 0,
        revenue: body.predictedRevenue,
        type: 'FORECAST',
        accuracy: body.confidence,
        confidenceLevel: 95.0,
      },
    })

    return NextResponse.json({
      success: true,
      data: forecastResult,
    })
  } catch (error) {
    console.error('Error saving forecast:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save forecast',
      },
      { status: 500 }
    )
  }
}

// Endpoint untuk mengambil forecast
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const forecasts = await prisma.forecastResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: forecasts,
    })
  } catch (error) {
    console.error('Error fetching forecasts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch forecasts',
      },
      { status: 500 }
    )
  }
}
