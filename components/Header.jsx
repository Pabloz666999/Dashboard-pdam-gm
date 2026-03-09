import UserProfile from '@/components/UserProfile'

export default function Header() {
  return (
    <header className="bg-white border-b-2 border-primary shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-14 rounded-xl overflow-hidden">
              <img
                src="/image/pdam_giri_menang_logo.jpeg"
                alt="Logo PTAM"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">PTAM Giri Menang</h1>
              <p className="text-sm text-gray-600">Sistem Forecasting Pendapatan</p>
            </div>
          </div>
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
