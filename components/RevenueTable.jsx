'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { 
  Search, 
  RefreshCw, 
  Download, 
  Wand2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react'

export default function RevenueTable({ revenues }) {
  const router = useRouter()
  
  // -- State untuk Hydration Safety --
  const [mounted, setMounted] = useState(false)
  
  // -- State Operasional --
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('') 
  const [currentActualPage, setCurrentActualPage] = useState(1)
  const [currentForecastPage, setCurrentForecastPage] = useState(1)
  const itemsPerPage = 6

  // Pastikan komponen sudah menempel di browser sebelum render data sensitif (tanggal/angka)
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount) => `Rp ${(amount / 1000000).toFixed(1)}M`

  // Fungsi Pencarian
  const filterData = (dataArray) => {
    if (!searchQuery) return dataArray;
    const lowerQuery = searchQuery.toLowerCase()
    
    return dataArray.filter(r => {
      const periodStr = format(new Date(r.period), 'MMMM yyyy', { locale: id }).toLowerCase()
      const revenueStr = r.revenue.toString()
      return periodStr.includes(lowerQuery) || revenueStr.includes(lowerQuery)
    })
  }

  // Pisahkan Data & Urutkan secara Kronologis
  const actualRevenues = filterData(
    revenues
      .filter(r => r.type === 'ACTUAL')
      .sort((a, b) => new Date(a.period) - new Date(b.period))
  )

  const forecastRevenues = filterData(
    revenues
      .filter(r => r.type === 'FORECAST')
      .sort((a, b) => new Date(a.period) - new Date(b.period))
  )

  const totalActualPages = Math.ceil(actualRevenues.length / itemsPerPage)
  const startActualIndex = (currentActualPage - 1) * itemsPerPage
  const currentActualItems = actualRevenues.slice(startActualIndex, startActualIndex + itemsPerPage)

  const totalForecastPages = Math.ceil(forecastRevenues.length / itemsPerPage)
  const startForecastIndex = (currentForecastPage - 1) * itemsPerPage
  const currentForecastItems = forecastRevenues.slice(startForecastIndex, startForecastIndex + itemsPerPage)

  const handleSync = async () => {
    try {
      setIsSyncing(true)
      const toastId = toast.loading('Sinkronisasi 12 bulan data AI...') 

      const response = await fetch('/api/sync-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: 12 }) // Pastikan ini diubah ke 12
      })

      const result = await response.json()
      // ... sisa logika handleSync

      if (result.success) {
        toast.success('Data prediksi diperbarui!', { id: toastId }) 
        setCurrentForecastPage(1) 
        setSearchQuery('') 
        router.refresh() 
      } else {
        toast.error('Gagal: ' + result.error, { id: toastId }) 
      }
    } catch (error) {
      toast.error('Kesalahan server.', { id: toastId })
    } finally {
      setIsSyncing(false)
    }
  }

  const exportToCSV = () => {
    const dataToExport = [...actualRevenues, ...forecastRevenues].sort(
      (a, b) => new Date(a.period) - new Date(b.period)
    )

    if (dataToExport.length === 0) return toast.error('Data kosong.')

    let csvContent = "Periode,Tipe,Total Pelanggan,Konsumsi (m3),Pendapatan (Rp)\n"
    dataToExport.forEach(row => {
      const periode = format(new Date(row.period), 'MMMM yyyy', { locale: id })
      const tipe = row.type === 'ACTUAL' ? 'Aktual' : 'Forecast'
      csvContent += `"${periode}","${tipe}","${row.totalCustomers || ''}","${row.totalConsumption || ''}","${row.revenue}"\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Laporan_PTAM_${format(new Date(), 'dd-MM-yyyy')}.csv`
    link.click()
    toast.success('CSV berhasil diunduh!')
  }

  const renderTableSection = (
    title, Icon, titleColor, data, currentPage, setCurrentPage, totalPages, startIndex, emptyMessage, isForecast
  ) => (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg bg-white border border-gray-100 shadow-sm ${titleColor}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periode</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pelanggan</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Konsumsi</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pendapatan</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {!mounted ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-400">Menyiapkan data...</td></tr>
            ) : data.length > 0 ? (
              data.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900" suppressHydrationWarning>
                    {format(new Date(revenue.period), 'MMMM yyyy', { locale: id })}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600" suppressHydrationWarning>
                    {revenue.totalCustomers?.toLocaleString('id-ID') || '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-medium" suppressHydrationWarning>
                    {revenue.totalConsumption 
                      ? `${revenue.totalConsumption.toLocaleString('id-ID')} m³` 
                      : '-'}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors" suppressHydrationWarning>
                    {formatCurrency(revenue.revenue)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                      isForecast ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {isForecast ? 'Forecast' : 'Actual'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-sm text-gray-400 italic bg-gray-50/30">
                  {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mounted && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Data <span className="text-gray-900 font-bold">{startIndex + 1}</span> -{' '}
            <span className="text-gray-900 font-bold">
              {Math.min(startIndex + itemsPerPage, data.length)}
            </span>{' '}
            dari <span className="text-gray-900 font-bold">{data.length}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-gray-700 mx-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Data Pendapatan Detail</h3>
          <p className="text-sm text-gray-500 mt-1">Analisis riwayat dan proyeksi pendapatan bulanan.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari periode atau nominal..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentActualPage(1) 
                setCurrentForecastPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>
          
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
              isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 shadow-lg'
            }`}
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {isSyncing ? 'Sinkronisasi...' : 'Update AI'}
          </button>

          <button 
            onClick={exportToCSV}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {renderTableSection(
        "Proyeksi Pendapatan (Forecast)", Wand2, "text-orange-500",
        currentForecastItems, currentForecastPage, setCurrentForecastPage, totalForecastPages, startForecastIndex,
        "Belum ada data prediksi.", true
      )}

      <div className="my-10 border-t border-dashed border-gray-100"></div>

      {renderTableSection(
        "Riwayat Pendapatan (Actual)", Database, "text-blue-500",
        currentActualItems, currentActualPage, setCurrentActualPage, totalActualPages, startActualIndex,
        "Data historis tidak ditemukan.", false
      )}
    </div>
  )
}