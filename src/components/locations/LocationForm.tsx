'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { createLocationSchema } from '@/lib/schemas';
import type { CreateLocationSchema } from '@/lib/schemas';
import {
  POLISH_CITIES_WITH_PROVINCES,
  getCityDisplayName,
  SYSTEM_LOSSES,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationFormProps {
  onSubmit: (data: CreateLocationSchema) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateLocationSchema>;
  isLoading?: boolean;
}

export function LocationForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: LocationFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: initialData?.name || '',
      city: initialData?.city || '',
      pv_power_kwp: initialData?.pv_power_kwp || 0,
      system_losses:
        initialData?.system_losses ?? Math.round(SYSTEM_LOSSES * 100),
      mwe_code: initialData?.mwe_code || '',
      user_id: initialData?.user_id || '',
    },
  });

  const selectedCity = watch('city');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Nazwa lokalizacji
        </label>
        <Input
          {...register('name')}
          id="name"
          placeholder="np. Biuro, Magazyn, Dom"
          className="mt-1"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-300"
        >
          Miasto / Województwo
        </label>
        <Select
          value={selectedCity}
          onValueChange={(value) => setValue('city', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Wybierz miasto" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(POLISH_CITIES_WITH_PROVINCES).map((city) => (
              <SelectItem key={city} value={city}>
                {getCityDisplayName(city)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.city && (
          <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pv_power_kwp"
          className="block text-sm font-medium text-gray-300"
        >
          Moc instalacji (kWp - kilowatt peak)
        </label>
        <Input
          {...register('pv_power_kwp', { valueAsNumber: true })}
          id="pv_power_kwp"
          type="number"
          step="0.1"
          min="0"
          max="1000"
          placeholder="np. 6.5"
          className="mt-1"
        />
        {errors.pv_power_kwp && (
          <p className="text-red-400 text-sm mt-1">
            {errors.pv_power_kwp.message}
          </p>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
        >
          {showAdvanced ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          Ustawienia zaawansowane
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="system_losses"
                className="block text-sm font-medium text-gray-300"
              >
                <div className="flex items-center gap-2">
                  Sprawność systemu (%)
                  <div className="group relative">
                    <Info className="h-4 w-4 text-gray-500 hover:text-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-gray-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                      Współczynnik sprawności systemu uwzględniający straty w
                      falowniku, okablowaniu, zabrudzeniu paneli, cieniowaniu
                      itp. Domyślnie: {Math.round(SYSTEM_LOSSES * 100)}%
                    </div>
                  </div>
                </div>
              </label>
              <Input
                {...register('system_losses', {
                  valueAsNumber: true,
                  setValueAs: (value) =>
                    value === '' ? undefined : Number(value),
                })}
                id="system_losses"
                type="number"
                step="1"
                min="1"
                max="100"
                placeholder={`Domyślnie: ${Math.round(SYSTEM_LOSSES * 100)}%`}
                className="mt-1"
              />
              {errors.system_losses && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.system_losses.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Pozostaw puste aby użyć domyślnej wartości (
                {Math.round(SYSTEM_LOSSES * 100)}%)
              </p>
            </div>

            <div>
              <label
                htmlFor="mwe_code"
                className="block text-sm font-medium text-gray-300"
              >
                Kod MWE (opcjonalnie)
              </label>
              <Input
                {...register('mwe_code')}
                id="mwe_code"
                placeholder="np. MWE_0984657_46T0001"
                className="mt-1"
              />
              {errors.mwe_code && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.mwe_code.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Kod jednostki wytwórczej zgodny z rejestrem URE. Jeśli podany, będzie używany jako domyślny w raportach.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Anuluj
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Zapisywanie...' : 'Zapisz lokalizację'}
        </Button>
      </div>
    </form>
  );
}
