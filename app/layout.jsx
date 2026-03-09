import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider' 

export const metadata = {
  title: 'Dashboard PTAM',
  description: 'Sistem Peramalan Pendapatan PTAM',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <AuthProvider> 
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: { background: '#333', color: '#fff', borderRadius: '10px' }
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}