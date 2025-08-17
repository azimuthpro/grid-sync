'use client'

import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-8">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Raporty energetyczne</h1>
        <p className="text-gray-400 mt-2">
          Generuj raporty CSV z bilansem energetycznym dla operatorów sieci
        </p>
      </div> */}

      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-md p-6">
        <div className="text-center py-12">
          <div className="mb-6">
            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-100 mb-2">Generator raportów</h3>
          <p className="text-gray-400 mb-6">Ta funkcjonalność jest w trakcie implementacji</p>
        </div>
      </div>
    </div>
  )
}