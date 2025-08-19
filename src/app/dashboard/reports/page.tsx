'use client'

import { ReportGenerator } from '@/components/reports/ReportGenerator'

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Generator raportów MWE</h1>
        <p className="text-gray-400 mt-2">
          Generuj raporty CSV zgodne ze specyfikacją MWE dla operatorów sieci elektroenergetycznej
        </p>
      </div>

      <ReportGenerator />
    </div>
  )
}