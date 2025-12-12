'use client';

import { useState, useMemo, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, ChartLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InsolationData } from '@/types';

interface InsolationChartProps {
  data: InsolationData[];
  className?: string;
  showComparison?: boolean;
  viewType?: 'hourly' | 'daily' | 'monthly';
  onViewTypeChange?: (viewType: 'hourly' | 'daily' | 'monthly') => void;
  isLoading?: boolean;
}

type ChartType = 'line' | 'bar';

const InsolationChartComponent = function InsolationChart({
  data,
  className = '',
  viewType = 'daily',
  onViewTypeChange,
  isLoading = false,
}: InsolationChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  // Process backend data for display
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => {
      let time: string;
      let displayData: Record<string, unknown> = { ...item };

      if (viewType === 'hourly') {
        // For hourly data, format time display
        time = `${item.date} ${item.hour?.toString().padStart(2, '0')}:00`;
        displayData = {
          ...item,
          time,
          insolation: Number(item.insolation_percentage.toFixed(2)),
        };
      } else if (viewType === 'daily') {
        // For daily data, use date as time
        time = item.date;
        displayData = {
          ...item,
          time,
          insolation: Number(item.insolation_percentage.toFixed(2)),
        };
      } else if (viewType === 'monthly') {
        // For monthly data, format month display
        const monthKey =
          ((item as unknown as Record<string, unknown>).month as string) ||
          item.date?.substring(0, 7);
        if (monthKey) {
          const [year, monthNum] = monthKey.split('-');
          const monthNames = [
            'Styczeń',
            'Luty',
            'Marzec',
            'Kwiecień',
            'Maj',
            'Czerwiec',
            'Lipiec',
            'Sierpień',
            'Wrzesień',
            'Październik',
            'Listopad',
            'Grudzień',
          ];
          time = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        } else {
          time = item.date || '';
        }
        displayData = {
          ...item,
          time,
          insolation: Number(item.insolation_percentage.toFixed(2)),
        };
      } else {
        time = item.date;
        displayData = {
          ...item,
          time,
          insolation: Number(item.insolation_percentage.toFixed(2)),
        };
      }

      return displayData;
    });
  }, [data, viewType]);

  // Early return after all hooks
  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}
      >
        <div className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Brak danych do wyświetlenia</p>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: readonly {
      payload: Record<string, string | number>;
      value: number;
    }[];
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-gray-200 font-medium">{label}</p>
          <p className="text-blue-400">
            Nasłonecznienie: {payload[0].value.toFixed(1)}%
          </p>
          {data.dates && (
            <p className="text-gray-400 text-sm">Dni: {data.dates}</p>
          )}
          {data.count && (
            <p className="text-gray-400 text-sm">
              Pomiarów &gt; 0%: {data.count}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gray-900 rounded-lg  ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartLine className="h-4 w-4 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-100">Wykres</h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* View type selector */}
            {onViewTypeChange && (
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => onViewTypeChange('hourly')}
                  disabled={isLoading}
                  className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
                    viewType === 'hourly'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Godzinowy
                </button>
                <button
                  onClick={() => onViewTypeChange('daily')}
                  disabled={isLoading}
                  className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
                    viewType === 'daily'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Dzienny
                </button>
                <button
                  onClick={() => onViewTypeChange('monthly')}
                  disabled={isLoading}
                  className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
                    viewType === 'monthly'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Miesięczny
                </button>
              </div>
            )}

            {/* Chart type selector */}
            <div className="flex space-x-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pr-4 pb-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => {
                    if (viewType === 'hourly') {
                      // Show only time for hourly view
                      return value.split(' ')[1] || value;
                    }
                    return value;
                  }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={CustomTooltip} />
                <Line
                  type="monotone"
                  dataKey="insolation"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => {
                    if (viewType === 'hourly') {
                      return value.split(' ')[1] || value;
                    }
                    return value;
                  }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={CustomTooltip} />
                <Bar
                  dataKey="insolation"
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

InsolationChartComponent.displayName = 'InsolationChart';

export const InsolationChart = memo(InsolationChartComponent);
