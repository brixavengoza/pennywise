'use client';

import { useMemo } from 'react';
import { Box, Heading, Text, VStack, Skeleton } from '@chakra-ui/react';
import { useCategorySpending } from '@/hooks/useCategorySpending';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { useColorMode } from '@/components/ui/color-mode';
import { useCurrency } from '@/hooks/useCurrency';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#F56565', '#ED8936', '#ECC94B', '#48BB78', '#38B2AC', '#4299E1', '#9F7AEA', '#ED64A6'];

const createDoughnutLabelPlugin = (colorMode: string) => ({
  id: 'doughnutLabel',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;
    
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
    
    if (total === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta.data.forEach((segment: any, index: number) => {
      if (!segment || typeof segment.x === 'undefined' || typeof segment.y === 'undefined') return;
      
      const value = dataset.data[index];
      const percentage = ((value / total) * 100).toFixed(1);
      
      const startAngle = segment.startAngle || 0;
      const endAngle = segment.endAngle || 0;
      const innerRadius = segment.innerRadius || 0;
      const outerRadius = segment.outerRadius || 0;
      
      const angle = (startAngle + endAngle) / 2;
      const radius = (innerRadius + outerRadius) / 2;
      const x = segment.x + Math.cos(angle) * radius;
      const y = segment.y + Math.sin(angle) * radius;
      
      ctx.save();
      const textColor = chart.options?.plugins?.legend?.labels?.color || (colorMode === 'dark' ? '#E2E8F0' : '#2D3748');
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage}%`, x, y);
      ctx.restore();
    });
  },
});

export const SpendingCategoryPieChart = () => {
  const { startDate, endDate } = useAnalyticsDateStore();
  const { categorySpending, isLoading } = useCategorySpending({ startDate, endDate });
  const { colorMode } = useColorMode();
  const { formatAmount } = useCurrency();

  const chartData = useMemo(() => {
    if (!categorySpending || categorySpending.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
          borderWidth: 2,
        }],
      };
    }

    return {
      labels: categorySpending.map((cat) => cat.name),
      datasets: [{
        data: categorySpending.map((cat) => Number(cat.amount)),
        backgroundColor: COLORS,
        borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
        borderWidth: 2,
      }],
    };
  }, [categorySpending, colorMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: colorMode === 'dark' ? '#E2E8F0' : '#2D3748',
          font: {
            family: 'Poppins',
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: colorMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)',
        padding: 12,
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
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            const value = formatAmount(context.parsed);
            return `${context.label}: ${value}`;
          },
        },
      },
      doughnutLabel: createDoughnutLabelPlugin(colorMode),
    },
  };

  return (
    <Box
      bg="bg-card"
      p={{ base: 4, lg: 6 }}
      borderRadius="xl"
    >
      <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
        <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary">
          Spending by Category
        </Heading>
        {isLoading ? (
          <Skeleton height={{ base: '250px', lg: '300px' }} borderRadius="md" />
        ) : chartData.datasets[0].data.length > 0 ? (
          <Box height={{ base: '250px', lg: '300px' }}>
            <Doughnut data={chartData} options={options} plugins={[createDoughnutLabelPlugin(colorMode)]} />
          </Box>
        ) : (
          <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={8}>
            No spending data available for this period
          </Text>
        )}
      </VStack>
    </Box>
  );
};
