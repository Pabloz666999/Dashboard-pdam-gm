export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-16 bg-white border-b border-gray-200 mb-8 w-full"></div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="h-8 bg-gray-200 rounded-lg w-64 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-96 mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 flex flex-col justify-center">
              <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded-md w-1/3"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-96">
            <div className="h-6 bg-gray-200 rounded-md w-48 mb-6"></div>
            <div className="h-full bg-gray-100 rounded-xl w-full"></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-96 flex flex-col items-center">
            <div className="h-6 bg-gray-200 rounded-md w-40 mb-10 self-start"></div>
            <div className="h-48 w-48 bg-gray-200 rounded-full mb-4"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-96">
           <div className="flex justify-between items-center mb-8">
             <div className="h-6 bg-gray-200 rounded-md w-56"></div>
             <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
           </div>
           <div className="space-y-4">
             <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
             <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
             <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
             <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
           </div>
        </div>
        
      </main>
    </div>
  )
}