'use client';

import { ReportGenerator } from '@/components/reports/ReportGenerator';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Generator raportów MWE
        </h1>
      </div>

      <ReportGenerator />
    </div>
  );
}
