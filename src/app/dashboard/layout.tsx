'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import {
  Gauge,
  MapPin,
  Settings,
  LogOut,
  BarChart3,
  Sun,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Start', href: '/dashboard', icon: Gauge },
  { name: 'Lokalizacje', href: '/dashboard/locations', icon: MapPin },
  { name: 'Nasłonecznienie', href: '/dashboard/insolation', icon: Sun },
  { name: 'Raporty', href: '/dashboard/reports', icon: FileSpreadsheet },
  { name: 'Ustawienia', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useSupabase();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Dashboard: Błąd pobierania użytkownika:', error);
        router.push('/login');
        return;
      }

      if (!user) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else if (session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Błąd wylogowania:', error);
        throw error;
      }
    } catch (error) {
      console.error('Błąd podczas wylogowania:', error);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 mt-4">
            <span className="text-xl font-bold text-gray-100">GridSync</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Wyloguj się
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
