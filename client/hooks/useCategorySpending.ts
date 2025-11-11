import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { CategorySpending, CategorySpendingParams } from '@/types';

const fetchCategorySpending = async (url: string): Promise<CategorySpending[]> => {
  const response = await apiClient.get<{ success: boolean; data: CategorySpending[] }>(url);
  return response.data.data || [];
};

export const useCategorySpending = (params?: CategorySpendingParams) => {
  const { data: session } = useSession();
  
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const url = `/api/analytics/category-spending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, isLoading, mutate, error } = useSWR<CategorySpending[]>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchCategorySpending,
    { revalidateOnFocus: true }
  );

  return { 
    categorySpending: data || [], 
    isLoading, 
    mutate, 
    error 
  };
};

