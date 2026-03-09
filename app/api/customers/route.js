import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where = {}
    if (category) where.category = category
    if (isActive !== null) where.isActive = isActive === 'true'

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        consumptions: {
          orderBy: { period: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: customers,
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customers',
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const customer = await prisma.customer.create({
      data: {
        customerCode: body.customerCode,
        name: body.name,
        address: body.address,
        phone: body.phone,
        category: body.category,
      },
    })

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create customer',
      },
      { status: 500 }
    )
  }
}
