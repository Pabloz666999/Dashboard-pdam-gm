'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  Zap, 
  TrendingDown, 
  ArrowUpRight, 
  Droplets,
} from 'lucide-react'

export default function DashboardStats({ stats }) {
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0'
    return `Rp ${(amount / 1000000).toFixed(1)}M`
  }

  const cards = [
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers?.toLocaleString('id-ID') || '0',
      subValue: 'Pelanggan Aktif',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: formatCurrency(stats.currentMonthRevenue?.revenue),
      subValue: 'Data Aktual Terbaru',
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      title: 'Prediksi Bulan Depan',
      value: formatCurrency(stats.nextMonthForecast?.revenue),
      subValue: 'Estimasi AI (Forecast)',
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Pertumbuhan Bulanan',
      value: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`,
      subValue: 'Dibandingkan Bulan Lalu',
      icon: stats.revenueGrowth >= 0 
        ? <TrendingUp className="w-6 h-6 text-emerald-600" /> 
        : <TrendingDown className="w-6 h-6 text-rose-600" />,
      bgColor: stats.revenueGrowth >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      borderColor: stats.revenueGrowth >= 0 ? 'border-emerald-100' : 'border-rose-100',
      statusColor: stats.revenueGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={`bg-white p-6 rounded-2xl border ${card.borderColor} shadow-sm hover:shadow-md transition-all group`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Live
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {card.value}
            </h3>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-200 mr-2"></span>
              {card.subValue}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}