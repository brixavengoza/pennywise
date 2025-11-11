import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { Category, CategoriesParams } from '@/types';

const fetchCategories = async (url: string): Promise<Category[]> => {
  const response = await apiClient.get<{ success: boolean; data: Category[] }>(url);
  return response.data.data || [];
};

export const useCategories = (params?: CategoriesParams) => {
  const { data: session } = useSession();
  
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  
  const url = `/api/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, isLoading, mutate, error } = useSWR<Category[]>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchCategories,
    { revalidateOnFocus: true }
  );

  return { 
    categories: data || [], 
    isLoading, 
    mutate, 
    error 
  };
};

