import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') // 'ACTUAL' or 'FORECAST'

    const where = type ? { type } : {}

    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { period: 'desc' },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: revenues,
    })
  } catch (error) {
    console.error('Error fetching revenues:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch revenues',
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const revenue = await prisma.revenue.create({
      data: {
        period: new Date(body.period),
        totalCustomers: body.totalCustomers,
        totalConsumption: body.totalConsumption,
        revenue: body.revenue,
        type: body.type,
        accuracy: body.accuracy || null,
        confidenceLevel: body.confidenceLevel || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: revenue,
    })
  } catch (error) {
    console.error('Error creating revenue:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create revenue',
      },
      { status: 500 }
    )
  }
}
