'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const toastId = toast.loading('Memverifikasi...')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, 
      })

      if (result.error) {
        toast.error(result.error, { id: toastId })
      } else {
        toast.success('Login berhasil!', { id: toastId })
        router.push('/') 
        router.refresh()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center items-center mb-8">
          <div className="w-16 h-14 rounded-xl mx-auto mb-4">
              <img
                src="/image/pdam_giri_menang_logo.jpeg"
                alt="Logo PTAM"
                className="w-full h-full object-contain"
              />
            </div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard PTAM</h2>
          <p className="text-sm text-gray-500 mt-2">Silakan login untuk mengakses data peramalan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="admin@ptam.co.id"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-xl text-white font-bold transition-all ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk Sistem'}
          </button>
        </form>
      </div>
    </div>
  )
}