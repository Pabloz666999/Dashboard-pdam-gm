import DashboardStats from '@/components/DashboardStats'
import RevenueChart from '@/components/RevenueChart'
import CustomerDistribution from '@/components/CustomerDistribution'
import RevenueTable from '@/components/RevenueTable'
import RegionChart from '@/components/RegionChart'
import Header from '@/components/Header'
import prisma from '@/lib/prisma'

async function getDashboardData() {

  const actualRevenues = await prisma.revenue.findMany({
    where: { type: 'ACTUAL' },
    orderBy: { period: 'desc' },
    take: 2,
  })

  const current = actualRevenues[0]?.revenue || 0
  const previous = actualRevenues[1]?.revenue || 0

  let growthPercentage = 0
  if (previous > 0) {
    growthPercentage = ((current - previous) / previous) * 100
  }

  const revenues = await prisma.revenue.findMany({
    orderBy: { period: 'desc' },
  })

  const customersByCategory = await prisma.customer.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: true,
  })

  const regionDistribution = await prisma.customer.groupBy({
    by: ['address'],
    where: { isActive: true },
    _count: true,
    orderBy: { _count: { address: 'desc' } }
  })

  const totalCustomers = await prisma.customer.count({ where: { isActive: true } })
  
  const currentMonthRevenue = await prisma.revenue.findFirst({
    where: { type: 'ACTUAL' },
    orderBy: { period: 'desc' },
  })

  const nextMonthForecast = await prisma.revenue.findFirst({
    where: { type: 'FORECAST' },
    orderBy: { period: 'asc' },
  })

  const latestPerformance = await prisma.modelPerformance.findFirst({
    orderBy: { createdAt: 'desc' },
  })

  return {
    revenues,
    customersByCategory,
    regionDistribution,
    stats: {
      totalCustomers,
      currentMonthRevenue,
      nextMonthForecast,
      revenueGrowth: growthPercentage,
    },
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <DashboardStats stats={data.stats} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart revenues={data.revenues} />
          </div>
          <div>
            <CustomerDistribution distribution={data.customersByCategory} />
          </div>
        </div>

        {/* Region Mapping Chart */}
        <div className="mb-6">
          <RegionChart regionData={data.regionDistribution} />
        </div>

        {/* Detailed Data Table */}
        <RevenueTable revenues={data.revenues} />
      </main>
    </div>
  )
}