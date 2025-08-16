'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConsumptionGrid } from './ConsumptionGrid'
import { ConsumptionToolbar } from './ConsumptionToolbar'
import { profilesToGridData, gridDataToProfiles } from '@/lib/utils/consumption'
import type { ConsumptionGridData } from '@/lib/utils/consumption'
import type { ConsumptionProfile } from '@/types'

interface ConsumptionProfileEditorProps {
  locationId: string
  locationName: string
  initialProfiles?: ConsumptionProfile[]
  onSave: (profiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>
  isLoading?: boolean
  isSaving?: boolean
}

export function ConsumptionProfileEditor({
  locationId,
  locationName,
  initialProfiles = [],
  onSave,
  isLoading = false,
  isSaving = false
}: ConsumptionProfileEditorProps) {
  const [gridData, setGridData] = useState<ConsumptionGridData>(() => 
    profilesToGridData(initialProfiles)
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalData, setOriginalData] = useState<ConsumptionGridData>(() => 
    profilesToGridData(initialProfiles)
  )

  // Update grid data when initial profiles change
  useEffect(() => {
    const newGridData = profilesToGridData(initialProfiles)
    setGridData(newGridData)
    setOriginalData(newGridData)
    setHasUnsavedChanges(false)
  }, [initialProfiles])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(gridData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)
  }, [gridData, originalData])

  const handleDataChange = useCallback((newGridData: ConsumptionGridData) => {
    setGridData(newGridData)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const profiles = gridDataToProfiles(gridData, locationId)
      await onSave(profiles)
      setOriginalData(gridData)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save consumption profiles:', error)
      // Error handling could be improved with toast notifications
    }
  }, [gridData, locationId, onSave])

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        handleSave()
      }
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [hasUnsavedChanges, handleSave])

  // Warning for unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              Profil zużycia energii
            </h2>
            <p className="text-gray-400">
              Lokalizacja: <span className="text-gray-300 font-medium">{locationName}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Zdefiniuj wzorzec zużycia energii dla każdej godziny tygodnia (168 punktów)
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Niezapisane zmiany
              </div>
              <div className="text-xs text-yellow-400/80 mt-1">
                Automatyczne zapisywanie za {hasUnsavedChanges ? '5s' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <ConsumptionToolbar
        gridData={gridData}
        onDataChange={handleDataChange}
        onSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Grid */}
      <ConsumptionGrid
        gridData={gridData}
        onDataChange={handleDataChange}
        isLoading={isLoading}
      />

      {/* Footer info */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="text-sm text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400'}>
              {hasUnsavedChanges ? 'Niezapisane zmiany' : 'Zapisano'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ostatnia aktualizacja:</span>
            <span>{new Date().toLocaleString('pl-PL')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}