'use client'

import { Settings, User as UserIcon, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-600 mt-2">
          Zarządzaj preferencjami konta i aplikacji
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Panel ustawień</h3>
          <p className="text-gray-500 mb-6">Ta funkcjonalność jest w trakcie implementacji</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">Planowane funkcje:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Ustawienia profilu użytkownika
              </li>
              <li className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Preferencje powiadomień
              </li>
              <li className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Bezpieczeństwo i prywatność
              </li>
              <li className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Zarządzanie danymi
              </li>
            </ul>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Aplikacja w wersji: 0.1.1
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}