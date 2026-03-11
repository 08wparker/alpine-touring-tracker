import dynamic from 'next/dynamic'

const SilvrettaMap = dynamic(() => import('@/components/SilvrettaMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

export default function Silvretta() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img 
          src="/piz_buin.jpg" 
          alt="Piz Buin from Ochsentaler Glacier" 
          className="w-24 h-24 flex-shrink-0 rounded-lg object-cover shadow-md"
        />
        <h1 className="text-4xl font-bold text-alpine-green">
          Silvretta Group: Austria-Switzerland
        </h1>
      </div>
      
      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regional Map</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <SilvrettaMap className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}