import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { Budget, BudgetParams } from '@/types';

const fetchBudgets = async (url: string): Promise<Budget[]> => {
  const response = await apiClient.get<{ success: boolean; data: Budget[] }>(url);
  return response.data.data || [];
};

export const useBudgets = (params?: BudgetParams) => {
  const { data: session } = useSession();
  
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());
  
  const url = `/api/budget${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, isLoading, mutate, error } = useSWR<Budget[]>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchBudgets,
    { revalidateOnFocus: true }
  );

  return { 
    budgets: data || [], 
    isLoading, 
    mutate, 
    error 
  };
};

