'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, HStack, Grid, Select, createListCollection } from '@chakra-ui/react';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { format } from 'date-fns';
import {
  FinancialHealthScore,
  YearOverYearComparison,
  SpendingCategoryPieChart,
  TopExpenses,
  BudgetPerformance,
} from '@/components/analytics';

export default function AnalyticsPage() {
  const { selectedMonth, selectedYear, setMonth, setYear } = useAnalyticsDateStore();

  const months = createListCollection({
    items: Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: format(new Date(2024, i, 1), 'MMMM'),
    })),
  });

  const currentYear = new Date().getFullYear();
  const years = createListCollection({
    items: Array.from({ length: 3 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    })),
  });

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{ base: 4, lg: 6 }}>
        <HStack justify="space-between" align="center" flexDirection={{ base: 'column', lg: 'row' }} alignSelf={{ base: 'stretch', lg: 'auto' }} gap={{ base: 3, lg: 0 }}>
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
              Analytics
            </Heading>
            <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-secondary" mt={{ base: 1, lg: 2 }}>
              Deep insights and financial trends
            </Text>
          </Box>
          <HStack gap={{ base: 1.5, lg: 2 }} w={{ base: '100%', lg: 'auto' }} justify={{ base: 'center', lg: 'flex-end' }}>
            <Select.Root
              collection={months}
              value={[selectedMonth.toString()]}
              onValueChange={(details) => {
                const newMonth = details.value[0];
                if (newMonth) setMonth(parseInt(newMonth));
              }}
              size="sm"
              w={{ base: '100%', lg: '140px' }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select month" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {months.items.map((month) => (
                    <Select.Item item={month} key={month.value}>
                      {month.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <Select.Root
              collection={years}
              value={[selectedYear.toString()]}
              onValueChange={(details) => {
                const newYear = details.value[0];
                if (newYear) setYear(parseInt(newYear));
              }}
              size="sm"
              w={{ base: '100%', lg: '120px' }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select year" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {years.items.map((year) => (
                    <Select.Item item={year} key={year.value}>
                      {year.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </HStack>
        </HStack>

        <Grid
          templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
          gap={{ base: 4, lg: 6 }}
        >
          <FinancialHealthScore />
          <YearOverYearComparison />
          <SpendingCategoryPieChart />
          <TopExpenses />
        </Grid>

        <BudgetPerformance />
      </VStack>
    </DashboardLayout>
  );
}
