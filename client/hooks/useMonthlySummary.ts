import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { MonthlySummary, MonthlySummaryParams } from '@/types';

const fetchMonthlySummary = async (url: string): Promise<MonthlySummary> => {
  const response = await apiClient.get<{ success: boolean; data: MonthlySummary }>(url);
  return response.data.data;
};

export const useMonthlySummary = (params?: MonthlySummaryParams) => {
  const { data: session } = useSession();
  
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());
  
  const url = `/api/analytics/monthly-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, isLoading, mutate, error } = useSWR<MonthlySummary>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchMonthlySummary,
    { revalidateOnFocus: true }
  );

  return { 
    monthlySummary: data, 
    isLoading, 
    mutate, 
    error 
  };
};

