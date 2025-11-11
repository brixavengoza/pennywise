import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { SpendingTrend, SpendingTrendsParams } from '@/types';

const fetchSpendingTrends = async (url: string): Promise<SpendingTrend[]> => {
  const response = await apiClient.get<{ success: boolean; data: SpendingTrend[] }>(url);
  return response.data.data || [];
};

export const useSpendingTrends = (params?: SpendingTrendsParams) => {
  const { data: session } = useSession();
  
  const months = params?.months || 6;
  const url = `/api/analytics/spending-trends?months=${months}`;
  
  const { data, isLoading, mutate, error } = useSWR<SpendingTrend[]>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchSpendingTrends,
    { revalidateOnFocus: true }
  );

  return { 
    spendingTrends: data || [], 
    isLoading, 
    mutate, 
    error 
  };
};

