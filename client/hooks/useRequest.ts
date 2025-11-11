import useSWR from 'swr';
import { apiClient } from '@/lib/axios';
import { useSession } from 'next-auth/react';
import {
  Category,
  MonthlySummary,
  MonthlySummaryParams,
  SpendingTrend,
  SpendingTrendsParams,
  CategorySpending,
  CategorySpendingParams,
  Budget,
  BudgetParams,
  TransactionsParams,
  TransactionsResponse,
  CategoriesParams,
} from '@/types';

export interface UseRequestReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<T | undefined>;
}

export function useRequest<T = unknown>(url: string | null): UseRequestReturn<T> {
  const { data: session } = useSession();

  const fetcher = async (endpoint: string): Promise<T> => {
    const response = await apiClient.get<{ success: boolean; data: T }>(endpoint);
    // Extract data from { success: true, data: {...} } response
    return response.data.data;
  };

  const { data, error, isLoading, mutate } = useSWR<T>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      revalidateOnMount: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export interface UsePostRequestReturn {
  <T = unknown>(url: string, payload: unknown): Promise<{ success: boolean; data?: T; error?: string }>;
}

export function usePostRequest(): UsePostRequestReturn {
  const { data: session } = useSession();

  return async <T = unknown>(url: string, payload: unknown) => {
    if (!(session as { accessToken?: string })?.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await apiClient.post<{ success: boolean; data?: T; error?: string }>(url, payload);
    return response.data;
  };
}

export interface UsePutRequestReturn {
  <T = unknown>(url: string, payload: unknown): Promise<{ success: boolean; data?: T; error?: string }>;
}

export function usePutRequest(): UsePutRequestReturn {
  const { data: session } = useSession();

  return async <T = unknown>(url: string, payload: unknown) => {
    if (!(session as { accessToken?: string })?.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await apiClient.put<{ success: boolean; data?: T; error?: string }>(url, payload);
    return response.data;
  };
}

export interface UseDeleteRequestReturn {
  <T = unknown>(url: string): Promise<{ success: boolean; data?: T; error?: string }>;
}

export function useDeleteRequest(): UseDeleteRequestReturn {
  const { data: session } = useSession();

  return async <T = unknown>(url: string) => {
    if (!(session as { accessToken?: string })?.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await apiClient.delete<{ success: boolean; data?: T; error?: string }>(url);
    return response.data;
  };
}

export function useGetMonthlySummary(params?: MonthlySummaryParams): UseRequestReturn<MonthlySummary> {
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());
  
  const url = `/api/analytics/monthly-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return useRequest<MonthlySummary>(url);
}

export function useGetSpendingTrends(params?: SpendingTrendsParams): UseRequestReturn<SpendingTrend[]> {
  const months = params?.months || 6;
  const url = `/api/analytics/spending-trends?months=${months}`;
  return useRequest<SpendingTrend[]>(url);
}

export function useGetCategorySpending(params?: CategorySpendingParams): UseRequestReturn<CategorySpending[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const url = `/api/analytics/category-spending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return useRequest<CategorySpending[]>(url);
}

export function useGetBudgets(params?: BudgetParams): UseRequestReturn<Budget[]> {
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());
  
  const url = `/api/budget${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return useRequest<Budget[]>(url);
}

export function useGetTransactions(params?: TransactionsParams): UseRequestReturn<TransactionsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return useRequest<TransactionsResponse>(url);
}

export function useGetCategories(params?: CategoriesParams): UseRequestReturn<Category[]> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  
  const url = `/api/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return useRequest<Category[]>(url);
}
