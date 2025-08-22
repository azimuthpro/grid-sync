'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConsumptionGrid } from './ConsumptionGrid';
import { ConsumptionToolbar } from './ConsumptionToolbar';
import {
  profilesToGridData,
  gridDataToProfiles,
} from '@/lib/utils/consumption';
import type { ConsumptionGridData } from '@/lib/utils/consumption';
import type { ConsumptionProfile } from '@/types';

interface ConsumptionProfileEditorProps {
  locationId: string;
  initialProfiles?: ConsumptionProfile[];
  onSave: (
    profiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[]
  ) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

export function ConsumptionProfileEditor({
  locationId,
  initialProfiles = [],
  onSave,
  isLoading = false,
  isSaving = false,
}: ConsumptionProfileEditorProps) {
  const [gridData, setGridData] = useState<ConsumptionGridData>(() =>
    profilesToGridData(initialProfiles)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ConsumptionGridData>(() =>
    profilesToGridData(initialProfiles)
  );

  // Update grid data when initial profiles change
  useEffect(() => {
    const newGridData = profilesToGridData(initialProfiles);
    setGridData(newGridData);
    setOriginalData(newGridData);
    setHasUnsavedChanges(false);
  }, [initialProfiles]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(gridData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [gridData, originalData]);

  const handleDataChange = useCallback((newGridData: ConsumptionGridData) => {
    setGridData(newGridData);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const profiles = gridDataToProfiles(gridData, locationId);
      await onSave(profiles);
      setOriginalData(gridData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save consumption profiles:', error);
      // Error handling could be improved with toast notifications
    }
  }, [gridData, locationId, onSave]);

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave]);

  // Warning for unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
    );
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}
