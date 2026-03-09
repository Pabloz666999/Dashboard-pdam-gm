'use client'

import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function RevenueChart({ revenues }) {
  const [timeFilter, setTimeFilter] = useState('1Y')

  const actualRevenues = revenues
    .filter(r => r.type === 'ACTUAL')
    .sort((a, b) => new Date(a.period) - new Date(b.period))
  
  const forecastRevenues = revenues
    .filter(r => r.type === 'FORECAST')
    .sort((a, b) => new Date(a.period) - new Date(b.period))

  let filteredActuals = actualRevenues
  if (timeFilter === '6M') {
    filteredActuals = actualRevenues.slice(-6)
  } else if (timeFilter === '1Y') {
    filteredActuals = actualRevenues.slice(-12)
  }

  const displayRevenues = [...filteredActuals, ...forecastRevenues]

  // IMPROVEMENT 2: Format label sumbu X menjadi lebih singkat (Contoh: "Jan '25")
  const labels = displayRevenues.map(r => 
    format(new Date(r.period), "MMM ''yy", { locale: id }) 
  )

  const actualData = displayRevenues.map(r => r.type === 'ACTUAL' ? r.revenue : null)
  const forecastData = displayRevenues.map(r => r.type === 'FORECAST' ? r.revenue : null)

  const data = {
    labels,
    datasets: [
      {
        label: 'Pendapatan Aktual',
        data: actualData,
        borderColor: '#0077BE',
        backgroundColor: 'rgba(0, 119, 190, 0.1)',
        borderWidth: 2.5, // Sedikit dipertipis agar lebih elegan
        tension: 0.4,
        fill: true,
        pointRadius: 3, // IMPROVEMENT 3: Titik diperkecil
        pointHoverRadius: 6,
        spanGaps: true,
      },
      {
        label: 'Forecast AI',
        data: forecastData,
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderWidth: 2.5,
        borderDash: [5, 5],
        tension: 0.4,
        fill: true,
        pointRadius: 3, // Titik diperkecil
        pointHoverRadius: 6,
        spanGaps: true, 
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.2, // Sedikit dilebarkan secara horizontal
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { family: 'Work Sans', size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 50, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Work Sans' },
        bodyFont: { size: 12, family: 'Work Sans' },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) label += ': '
            if (context.parsed.y !== null) {
              label += 'Rp ' + (context.parsed.y / 1000000).toFixed(1) + 'M'
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false, // Membiarkan grafik fokus pada fluktuasi atas, tidak mulai dari 0
        ticks: {
          callback: function(value) { return 'Rp ' + (value / 1000000) + 'M' },
          font: { family: 'Work Sans', size: 11 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
      },
      x: {
        grid: { display: false },
        ticks: { 
          font: { family: 'Work Sans', size: 11 },
          maxRotation: 45, // Memiringkan teks sumbu X agar tidak bertabrakan
          minRotation: 0
        },
      },
    },
  }

  const getButtonClass = (filterValue) => {
    const baseClass = "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors "
    return timeFilter === filterValue
      ? baseClass + "bg-blue-600 text-white shadow-sm"
      : baseClass + "text-gray-600 hover:bg-gray-100 border border-gray-200 bg-white"
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Tren Pendapatan</h3>
          <p className="text-sm text-gray-500 mt-1">Aktual vs Prediksi Machine Learning</p>
        </div>
        
        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
          <button onClick={() => setTimeFilter('6M')} className={getButtonClass('6M')}>6 Bulan</button>
          <button onClick={() => setTimeFilter('1Y')} className={getButtonClass('1Y')}>1 Tahun</button>
          <button onClick={() => setTimeFilter('ALL')} className={getButtonClass('ALL')}>Semua</button>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  )
}