'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RegionChart({ regionData }) {
  const labels = regionData.map(d => d.address)
  const counts = regionData.map(d => d._count)

  // KUNCI 1: Hitung tinggi grafik secara dinamis!
  // Minimal tinggi 300px, tapi jika datanya banyak, tiap 1 wilayah diberi ruang 35px
  const dynamicChartHeight = Math.max(300, regionData.length * 35)

  const data = {
    labels,
    datasets: [
      {
        label: 'Jumlah Pelanggan',
        data: counts,
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        borderRadius: 4,
        barThickness: 16, // Sedikit dipertipis agar lebih rapi saat padat
      },
    ],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 35, 50, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Work Sans' },
        bodyFont: { size: 12, family: 'Work Sans' },
        displayColors: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
        ticks: { font: { family: 'Work Sans', size: 11 } }
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { 
          font: { family: 'Work Sans', size: 12, weight: '600' },
          color: '#4B5563',
          autoSkip: false // KUNCI 2: Paksa Chart.js untuk menampilkan SEMUA nama wilayah!
        }
      }
    }
  }

  return (
    // KUNCI 3: Kotak luar dikunci tingginya (misal: 450px) agar layout dashboard tidak rusak
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
      <div className="mb-4 shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Pemetaan Wilayah Pelanggan</h3>
        <p className="text-sm text-gray-500 mt-1">Distribusi pelanggan aktif berdasarkan area operasional</p>
      </div>
      
      {/* KUNCI 4: Wadah dalam diberi "overflow-y-auto" agar bisa di-scroll ke bawah */}
      <div className="flex-1 overflow-y-auto pr-2">
         {/* Tinggi area kanvas menyesuaikan hasil hitungan dynamicChartHeight */}
         <div className="relative w-full" style={{ height: `${dynamicChartHeight}px` }}>
           <Bar data={data} options={options} />
         </div>
      </div>
    </div>
  )
}