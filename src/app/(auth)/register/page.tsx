'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabase } from '@/hooks/useSupabase'
import { registerSchema, type RegisterSchema } from '@/lib/schemas'
import { getErrorMessage } from '@/lib/utils'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = useSupabase()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true)
    setError(null)

    try {
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('Błąd rejestracji:', error)
        throw error
      }
      setSuccess(true)
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-800">Konto zostało utworzone!</h2>
            <p className="text-green-700 mt-2">
              Sprawdź swoją skrzynkę pocztową i kliknij link aktywacyjny, aby dokończyć rejestrację.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Powrót do logowania
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Utwórz konto</h2>
        <p className="text-gray-600 mt-2">Dołącz do GridSync już dziś</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adres email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="twoj@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Hasło
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Potwierdź hasło
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Masz już konto?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  )
}