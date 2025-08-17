'use client'

import { Settings, User as UserIcon, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Ustawienia</h1>
        <p className="text-gray-400 mt-2">
          Zarządzaj preferencjami konta i aplikacji
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">Panel ustawień</h3>
          <p className="text-gray-400 mb-6">Ta funkcjonalność jest w trakcie implementacji</p>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Aplikacja w wersji: 0.1.4
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}