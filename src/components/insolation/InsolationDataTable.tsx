'use client';

import {
  ChevronUp,
  ChevronDown,
  Table,
  MoreHorizontal,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InsolationData } from '@/types';

type TimeRange = '24h' | '3d' | '7d' | '1m';

interface AggregatedInsolationData extends InsolationData {
  count?: number;
  cities?: number;
  provinces?: number;
  dates?: number;
  city_list?: string;
  month?: string;
}

interface InsolationDataTableProps {
  data: InsolationData[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  timeRange?: TimeRange;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  filters?: Record<string, string | number | boolean | undefined>;
  className?: string;
  currentDate?: string;
}

export function InsolationDataTable({
  data,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onTimeRangeChange,
  timeRange = '24h',
  onSortChange,
  sorting,
  className = '',
  currentDate,
}: InsolationDataTableProps) {
  const handleSort = (field: string) => {
    if (!onSortChange) return;

    const newOrder =
      sorting?.sortBy === field && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sorting?.sortBy !== field) {
      return <MoreHorizontal className="h-4 w-4 text-gray-500" />;
    }
    return sorting.sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-400" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-400" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatTime = (item: AggregatedInsolationData) => {
    // Always format as hourly time display (for raw records)
    return item.hour !== undefined
      ? formatHour(item.hour)
      : (item.date || '').split(' ')[1] || '';
  };

  const getInsolationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-amber-400';
    if (percentage >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const isFutureDate = (date: string) => {
    if (!currentDate) return false;
    return new Date(date) > new Date(currentDate);
  };

  const getRowStyling = (date: string) => {
    const base = 'hover:bg-gray-800/50 transition-colors';
    if (isFutureDate(date)) {
      return `${base} bg-blue-950/20 border-l-2 border-l-blue-500/50`;
    }
    return base;
  };

  const getDateStyling = (date: string) => {
    if (isFutureDate(date)) {
      return 'text-blue-300 font-medium';
    }
    return 'text-gray-300';
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}
      >
        <div className="p-8 text-center">
          <Table className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Brak danych do wyświetlenia</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Table className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-100">Tabela</h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            {onTimeRangeChange && (
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => onTimeRangeChange('24h')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
                      timeRange === '24h'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    1 dzień
                  </button>
                  <button
                    onClick={() => onTimeRangeChange('3d')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
                      timeRange === '3d'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    3 dni
                  </button>
                  <button
                    onClick={() => onTimeRangeChange('7d')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
                      timeRange === '7d'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    7 dni
                  </button>
                  <button
                    onClick={() => onTimeRangeChange('1m')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
                      timeRange === '1m'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    1 miesiąc
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-none">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Data</span>
                  {getSortIcon('date')}
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('hour')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Godzina</span>
                  {getSortIcon('hour')}
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('city')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Miasto</span>
                  {getSortIcon('city')}
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('province')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Województwo</span>
                  {getSortIcon('province')}
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('insolation_percentage')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Nasłonecznienie (%)</span>
                  {getSortIcon('insolation_percentage')}
                </button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {data.map((row, index) => (
              <tr
                key={`${row.id || index}`}
                className={getRowStyling(row.date)}
                style={{ borderLeft: 'none' }}
              >
                <td className="px-4 py-3 text-sm relative">
                  <span className={getDateStyling(row.date)}>
                    {formatDate(row.date)}
                  </span>
                  {isFutureDate(row.date) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Prognoza
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatTime(row)}
                </td>

                <td className="px-4 py-3 text-sm text-gray-300">{row.city}</td>

                <td className="px-4 py-3 text-sm text-gray-400">
                  {row.province || 'Nieznane'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-medium ${getInsolationColor(row.insolation_percentage)}`}
                  >
                    {row.insolation_percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="min-w-32"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                  Ładowanie...
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-2" />
                  Załaduj więcej
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
