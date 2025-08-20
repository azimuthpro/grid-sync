'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Download,
  FileText,
  MapPin,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import { createCSVDownloadUrl, downloadFile } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { UserLocation } from '@/types';

const reportFormSchema = z.object({
  location_id: z.string().min(1, 'Wybierz lokalizację'),
  mwe_code: z
    .string()
    .min(1, 'Kod MWE jest wymagany')
    .max(50, 'Kod MWE nie może przekraczać 50 znaków'),
  start_date: z.string().min(1, 'Data początkowa jest wymagana'),
  end_date: z.string().min(1, 'Data końcowa jest wymagana'),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface ReportGenerationResponse {
  success: boolean;
  data?: {
    csv_content: string;
    filename: string;
    metadata: {
      location: string;
      city: string;
      mwe_code: string;
      start_date: string;
      end_date: string;
      total_hours: number;
      validation_warnings: string[];
    };
  };
  error?: string;
  validation_errors?: string[];
  validation_warnings?: string[];
}

interface ReportPreviewData {
  success: boolean;
  data?: {
    location: UserLocation;
    data_availability: {
      insolation_samples: Array<{ date: string; hour: number }>;
      consumption_profiles_count: number;
      has_insolation_data: boolean;
      has_consumption_data: boolean;
      earliest_date: string | null;
      latest_date: string | null;
    };
  };
  error?: string;
}

export function ReportGenerator() {
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(
    null
  );
  const [generatedReport, setGeneratedReport] =
    useState<ReportGenerationResponse | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
  });

  const selectedLocationId = watch('location_id');

  // Locations are automatically loaded by the useLocations hook

  // Fetch preview data when location is selected
  useEffect(() => {
    if (selectedLocationId) {
      fetchPreviewData(selectedLocationId);
    }
  }, [selectedLocationId]);

  const fetchPreviewData = async (locationId: string) => {
    try {
      const response = await fetch(
        `/api/reports/generate?location_id=${locationId}`
      );
      const data: ReportPreviewData = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Error fetching preview data:', error);
      setPreviewData(null);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true);
    setErrors([]);
    setWarnings([]);
    setGeneratedReport(null);

    try {
      // Validate date range
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (startDate >= endDate) {
        setErrors(['Data końcowa musi być późniejsza niż data początkowa']);
        return;
      }

      // Check against available data range
      if (previewData?.data?.data_availability) {
        const availability = previewData.data.data_availability;

        if (availability.earliest_date && availability.latest_date) {
          const earliestAvailable = new Date(availability.earliest_date);
          const latestAvailable = new Date(availability.latest_date);

          if (startDate < earliestAvailable) {
            setErrors([
              `Data początkowa nie może być wcześniejsza niż ${earliestAvailable.toLocaleDateString('pl-PL')}`,
            ]);
            return;
          }

          if (endDate > latestAvailable) {
            setErrors([
              `Data końcowa nie może być późniejsza niż ${latestAvailable.toLocaleDateString('pl-PL')}`,
            ]);
            return;
          }
        }
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      });

      const result: ReportGenerationResponse = await response.json();

      if (!result.success) {
        setErrors(
          result.validation_errors || [result.error || 'Wystąpił błąd']
        );
        if (result.validation_warnings) {
          setWarnings(result.validation_warnings);
        }
      } else {
        setGeneratedReport(result);
        if (result.data?.metadata.validation_warnings) {
          setWarnings(result.data.metadata.validation_warnings);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setErrors(['Wystąpił błąd podczas generowania raportu']);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport?.data) return;

    const { csv_content, filename } = generatedReport.data;
    const url = createCSVDownloadUrl(csv_content);
    downloadFile(url, filename);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-100">
            Konfiguracja raportu
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Lokalizacja
              </label>
              <Select
                value={selectedLocationId || ''}
                onValueChange={(value) => setValue('location_id', value)}
                disabled={locationsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      locationsLoading ? 'Ładowanie...' : 'Wybierz lokalizację'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {location.name} ({location.city})
                        </span>
                        <span className="text-sm text-gray-400">
                          - {location.pv_power_kwp} kWp
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.location_id && (
                <p className="text-sm text-red-400">
                  {formErrors.location_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Kod MWE
              </label>
              <Input
                {...register('mwe_code')}
                placeholder="np. MWE_0984657_46T0001"
                className="bg-gray-800 border-gray-600"
                value="MWE_0984657_46T0001"
              />
              {formErrors.mwe_code && (
                <p className="text-sm text-red-400">
                  {formErrors.mwe_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Data początkowa
              </label>
              <Input
                type="date"
                {...register('start_date')}
                className="bg-gray-800 border-gray-600"
                min={
                  previewData?.data?.data_availability?.earliest_date ||
                  undefined
                }
                max={
                  previewData?.data?.data_availability?.latest_date || undefined
                }
              />
              {formErrors.start_date && (
                <p className="text-sm text-red-400">
                  {formErrors.start_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Data końcowa
              </label>
              <Input
                type="date"
                {...register('end_date')}
                className="bg-gray-800 border-gray-600"
                min={
                  previewData?.data?.data_availability?.earliest_date ||
                  undefined
                }
                max={
                  previewData?.data?.data_availability?.latest_date || undefined
                }
              />
              {formErrors.end_date && (
                <p className="text-sm text-red-400">
                  {formErrors.end_date.message}
                </p>
              )}
            </div>
          </div>


          <Button
            type="submit"
            disabled={isGenerating || !selectedLocationId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Generowanie...' : 'Generuj raport'}
          </Button>
        </form>
      </div>

      {/* Data Availability Preview */}
      {previewData?.data && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Dostępność danych
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {previewData.data.data_availability.has_insolation_data ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                Dane nasłonecznienia:{' '}
                {previewData.data.data_availability.has_insolation_data
                  ? 'Dostępne'
                  : 'Brak danych'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {previewData.data.data_availability.consumption_profiles_count ===
              168 ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : previewData.data.data_availability
                  .consumption_profiles_count > 0 ? (
                <AlertCircle className="h-5 w-5 text-amber-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                Profile zużycia:{' '}
                {previewData.data.data_availability.consumption_profiles_count}{' '}
                {previewData.data.data_availability
                  .consumption_profiles_count === 168 ? (
                  <span>rekordów (kompletny)</span>
                ) : (
                  <span>/ 168 rekordów (niekompletny)</span>
                )}
              </span>
            </div>
            {previewData.data.data_availability.latest_date && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">
                  Ostatnie dane:{' '}
                  {new Date(
                    previewData.data.data_availability.latest_date
                  ).toLocaleDateString('pl-PL')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors and Warnings */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-300">Błędy</h3>
          </div>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-200">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-300">
              Ostrzeżenia
            </h3>
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-amber-200">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated Report */}
      {generatedReport?.data && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Wygenerowany raport
            </h3>
            <Button
              onClick={downloadReport}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Pobierz CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400">Lokalizacja</div>
              <div className="text-lg font-semibold text-gray-100">
                {generatedReport.data.metadata.location}
              </div>
              <div className="text-sm text-gray-300">
                {generatedReport.data.metadata.city}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400">Okres</div>
              <div className="text-lg font-semibold text-gray-100">
                {format(
                  new Date(generatedReport.data.metadata.start_date),
                  'dd.MM.yyyy',
                  { locale: pl }
                )}{' '}
                -
                {format(
                  new Date(generatedReport.data.metadata.end_date),
                  'dd.MM.yyyy',
                  { locale: pl }
                )}
              </div>
              <div className="text-sm text-gray-300">
                {generatedReport.data.metadata.total_hours} godzin
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400">Kod MWE</div>
              <div className="text-lg font-semibold text-gray-100">
                {generatedReport.data.metadata.mwe_code}
              </div>
              <div className="text-sm text-gray-300">
                Z PAUTO (zużycie)
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Nazwa pliku</div>
            <div className="font-mono text-sm text-gray-100">
              {generatedReport.data.filename}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Instrukcja użycia
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
              1
            </div>
            <div>
              <strong>Wybierz lokalizację</strong> - Wybierz instalację PV, dla
              której chcesz wygenerować raport
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
              2
            </div>
            <div>
              <strong>Wprowadź kod MWE</strong> - Kod jednostki wytwórczej
              zgodny z rejestrem URE
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
              3
            </div>
            <div>
              <strong>Ustaw zakres dat</strong> - Maksymalnie 31 dni, nie więcej
              niż 30 dni w przyszłość
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
