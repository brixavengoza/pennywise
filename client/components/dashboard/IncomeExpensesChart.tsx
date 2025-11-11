'use client';

import { Box, HStack, Skeleton } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Select } from '@chakra-ui/react';
import { createListCollection } from '@chakra-ui/react';
import { useGetSpendingTrends } from '@/hooks/useRequest';
import { SpendingTrend } from '@/types';
import { format, subMonths } from 'date-fns';
import { useState } from 'react';
import { useColorMode } from '@/components/ui/color-mode';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const timeframes = createListCollection({
  items: [
    { value: 'annual', label: 'Annual' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
  ],
});

export function IncomeExpensesChart() {
  const [timeframe, setTimeframe] = useState('annual');
  const { colorMode } = useColorMode();

  const getMonthsToFetch = () => {
    switch (timeframe) {
      case 'weekly':
        return 2;
      case 'monthly':
        return 6;
      case 'annual':
        return 12;
      default:
        return 12;
    }
  };

  const monthsToFetch = getMonthsToFetch();
  const { data: spendingTrends, isLoading } = useGetSpendingTrends({ months: monthsToFetch });

  const labels: string[] = [];
  const incomeData: number[] = [];
  const expensesData: number[] = [];

  const getMonthsToShow = () => {
    switch (timeframe) {
      case 'weekly':
        return 7;
      case 'monthly':
        return 6;
      case 'annual':
        return 12;
      default:
        return 12;
    }
  };

  const monthsToShow = getMonthsToShow();

  if (spendingTrends && spendingTrends.length > 0) {
    if (timeframe === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        labels.push(format(date, 'MMM d'));
        
        const monthKey = format(date, 'yyyy-MM');
        const trend = spendingTrends.find((t: SpendingTrend) => {
          const trendMonth = new Date(t.month);
          return format(trendMonth, 'yyyy-MM') === monthKey;
        });
        
        if (trend) {
          incomeData.push((trend.income || 0) / 4.33);
          expensesData.push((trend.expenses || 0) / 4.33);
        } else {
          incomeData.push(0);
          expensesData.push(0);
        }
      }
    } else {
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        labels.push(format(date, 'MMM'));
        
        const monthKey = format(date, 'yyyy-MM');
        const trend = spendingTrends.find((t: SpendingTrend) => {
          const trendMonth = new Date(t.month);
          return format(trendMonth, 'yyyy-MM') === monthKey;
        });
        
        incomeData.push(trend?.income || 0);
        expensesData.push(trend?.expenses || 0);
      }
    }
  } else if (!isLoading) {
    for (let i = monthsToShow - 1; i >= 0; i--) {
      if (timeframe === 'weekly') {
        const date = new Date();
        date.setDate(date.getDate() - ((monthsToShow - 1 - i) * 7));
        labels.push(format(date, 'MMM d'));
      } else {
        const date = subMonths(new Date(), i);
        labels.push(format(date, 'MMM'));
      }
      incomeData.push(0);
      expensesData.push(0);
    }
  }

  const chartColors = {
    light: {
      income: '#0073E6',
      incomeFill: 'rgba(0, 115, 230, 0.6)',
      expenses: '#FFC441',
      expensesFill: 'rgba(255, 196, 65, 0.6)',
      tick: '#718096',
      grid: 'rgba(0, 0, 0, 0.05)',
      tooltipBg: 'rgba(0, 0, 0, 0.85)',
      tooltipBorder: 'rgba(255, 255, 255, 0.1)',
    },
    dark: {
      income: '#4299E1',
      incomeFill: 'rgba(66, 153, 225, 0.6)',
      expenses: '#F6AD55',
      expensesFill: 'rgba(246, 173, 85, 0.6)',
      tick: '#A0AEC0',
      grid: 'rgba(255, 255, 255, 0.1)',
      tooltipBg: 'rgba(0, 0, 0, 0.9)',
      tooltipBorder: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const colors = chartColors[colorMode as 'light' | 'dark'] || chartColors.light;

  const data = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data: expensesData,
        borderColor: colors.expenses,
        backgroundColor: colors.expensesFill,
        fill: true,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 8,
        borderWidth: 3,
        pointBackgroundColor: colors.expenses,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        stepped: 'before' as const,
      },
      {
        label: 'Income',
        data: incomeData,
        borderColor: colors.income,
        backgroundColor: colors.incomeFill,
        fill: true,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 8,
        borderWidth: 3,
        pointBackgroundColor: colors.income,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        stepped: 'before' as const,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: colors.tooltipBg,
        padding: 14,
        titleFont: {
          family: 'Poppins',
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: 'Poppins',
          size: 12,
          weight: 500,
        },
        cornerRadius: 10,
        displayColors: true,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        boxPadding: 6,
        intersect: false,
        mode: 'index',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2000,
          font: {
            family: 'Poppins',
            size: 12,
            weight: 500,
          },
          color: colors.tick,
          padding: 8,
        },
        grid: {
          display: true,
          color: colors.grid,
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Poppins',
            size: 12,
            weight: 500,
          },
          color: colors.tick,
          padding: 8,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Box bg="bg-card" borderRadius="8px" p={6} boxShadow="shadow-card">
      <HStack justify="space-between" mb={4}>
        <Box
          bg="bg-badge"
          color="text-badge"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="medium"
        >
          Income & Expenses
        </Box>
        <Select.Root 
          collection={timeframes} 
          size="sm" 
          width="100px" 
          value={[timeframe]}
          onValueChange={(details) => {
            const newTimeframe = details.value[0];
            if (newTimeframe) {
              setTimeframe(newTimeframe);
            }
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Annual" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {timeframes.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </HStack>
      <Box height="250px">
        {isLoading ? (
          <Skeleton height="100%" borderRadius="8px" />
        ) : (
          <Line data={data} options={options} />
        )}
      </Box>
    </Box>
  );
}
