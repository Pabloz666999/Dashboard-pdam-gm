'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const categoryLabels = {
  RUMAH_TANGGA: 'Rumah Tangga',
  KOMERSIAL: 'Komersial',
  INDUSTRI: 'Industri',
  SOSIAL: 'Sosial',
}

export default function CustomerDistribution({ distribution }) {
  const labels = distribution.map(d => categoryLabels[d.category] || d.category)
  const counts = distribution.map(d => d._count)

  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: ['#fffb00', '#00A3E0', '#ff0000', '#06D6A0'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Work Sans',
            size: 13,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 50, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Work Sans',
        },
        bodyFont: {
          size: 13,
          family: 'Work Sans',
        },
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return context.label + ': ' + context.parsed.toLocaleString() + ' (' + percentage + '%)'
          },
        },
      },
    },
  }

  return (
    <div className="bg-white p-7 rounded-2xl shadow-sm text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Distribusi Pelanggan</h3>
      <Doughnut data={data} options={options} />
    </div>
  )
}
