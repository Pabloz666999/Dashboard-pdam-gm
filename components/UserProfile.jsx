'use client'

import { useSession, signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    const toastId = toast.loading('Keluar dari sistem...')
    try {
      await signOut({ redirect: false }) 
      toast.success('Berhasil logout!', { id: toastId })
      window.location.href = '/login' 
    } catch (error) {
      toast.error('Gagal logout. Coba lagi.', { id: toastId })
      console.error('Logout error:', error)
    }
  }

  if (status === 'loading') {
    return <div className="animate-pulse h-10 w-48 bg-gray-200 rounded-xl"></div>
  }

  if (!session) return null

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-lg">
        {session.user?.name?.charAt(0) || 'A'}
      </div>

      <div className="hidden sm:block text-left mr-2">
        <p className="text-sm font-bold text-gray-900 leading-tight">
          {session.user?.name || 'Administrator'}
        </p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          {session.user?.role || 'Admin'} PTAM
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="ml-auto px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
        title="Keluar dari sistem"
      >
        Logout
      </button>
    </div>
  )
}