'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { passwordChangeSchema, type PasswordChangeSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const supabase = useSupabase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data: PasswordChangeSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current user
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();
      if (getUserError || !user?.email) {
        throw new Error('Nie można zweryfikować tożsamości użytkownika');
      }

      // Verify current password by attempting to sign in with it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (verifyError) {
        throw new Error('Aktualne hasło jest nieprawidłowe');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Hasło zostało pomyślnie zmienione');
      reset();
    } catch (error) {
      console.error('Błąd podczas zmiany hasła:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Ustawienia</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Password Change Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-blue-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-100">
                Zmiana hasła
              </h3>
              <p className="text-gray-400 text-sm">
                Aktualizuj hasło do swojego konta
              </p>
            </div>
          </div>

          {success && (
            <div className="bg-green-950/50 rounded-md p-3 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-950/50  rounded-md p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Aktualne hasło
              </label>
              <div className="mt-1 relative">
                <Input
                  {...register('currentPassword')}
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  placeholder="Wprowadź aktualne hasło"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Nowe hasło
              </label>
              <div className="mt-1 relative">
                <Input
                  {...register('newPassword')}
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="Wprowadź nowe hasło"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Potwierdź nowe hasło
              </label>
              <div className="mt-1 relative">
                <Input
                  {...register('confirmNewPassword')}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmNewPassword"
                  placeholder="Potwierdź nowe hasło"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Zmienianie hasła...' : 'Zmień hasło'}
              </Button>
            </div>
          </form>
        </div>

        {/* App Version */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            Informacje o aplikacji
          </h3>
          <p className="text-gray-400 text-sm">
            Wersja aplikacji:{' '}
            <span className="text-blue-400 font-mono">0.5.0</span>
          </p>
        </div>
      </div>
    </div>
  );
}
