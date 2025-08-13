'use client'

import { FileText, Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Raporty energetyczne</h1>
        <p className="text-gray-600 mt-2">
          Generuj raporty CSV z bilansem energetycznym dla operatorów sieci
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generator raportów</h3>
          <p className="text-gray-500 mb-6">Ta funkcjonalność jest w trakcie implementacji</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">Planowane funkcje:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Wybór zakresu dat
              </li>
              <li className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Obliczenia bilansu energetycznego
              </li>
              <li className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export do CSV
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}