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

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 border-r border-gray-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 h-16 px-5 border-b border-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
          >
            <BrandMark />
            <span className="text-base font-semibold tracking-tight text-gray-50">
              GridSync
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Główna nawigacja">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 px-3 h-10 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    active
                      ? 'bg-gray-800 text-gray-50 font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-blue-400'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-100'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0',
                      active ? 'text-blue-300' : 'text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 h-10 text-sm text-gray-400 hover:bg-gray-800/60 hover:text-gray-100 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
              Wyloguj się
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-60">
        <main className="min-h-screen mx-auto max-w-[1440px]">{children}</main>
      </div>
    </div>
  );
}

/** Sun resting on the grid line: production meets the network */
function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M4 14a7 7 0 0 1 14 0Z" fill="var(--sun)" />
      <path
        d="M1 14h20M4 18h14"
        stroke="var(--color-blue-400)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
