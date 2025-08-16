'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLocationSchema } from '@/lib/schemas'
import type { CreateLocationSchema } from '@/lib/schemas'
import { POLISH_CITIES_WITH_PROVINCES, getCityDisplayName } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LocationFormProps {
  onSubmit: (data: CreateLocationSchema) => Promise<void>
  onCancel: () => void
  initialData?: Partial<CreateLocationSchema>
  isLoading?: boolean
}

export function LocationForm({ onSubmit, onCancel, initialData, isLoading = false }: LocationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      name: initialData?.name || '',
      city: initialData?.city || '',
      pv_power_kwp: initialData?.pv_power_kwp || 0,
      is_primary: initialData?.is_primary ?? false,
      user_id: initialData?.user_id || ''
    }
  })

  const selectedCity = watch('city')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Nazwa lokalizacji
        </label>
        <Input
          {...register('name')}
          id="name"
          placeholder="np. Dom, Biuro, Magazyn"
          className="mt-1"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-300">
          Miasto
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
        <label htmlFor="pv_power_kwp" className="block text-sm font-medium text-gray-300">
          Moc instalacji (kWp - kilowatt peak)
        </label>
        <Input
          {...register('pv_power_kwp', { valueAsNumber: true })}
          id="pv_power_kwp"
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="np. 6.5"
          className="mt-1"
        />
        {errors.pv_power_kwp && (
          <p className="text-red-400 text-sm mt-1">{errors.pv_power_kwp.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          {...register('is_primary')}
          id="is_primary"
          type="checkbox"
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 bg-gray-900 rounded"
        />
        <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-300">
          Ustaw jako lokalizację główną
        </label>
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
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Zapisywanie...' : 'Zapisz lokalizację'}
        </Button>
      </div>
    </form>
  )
}