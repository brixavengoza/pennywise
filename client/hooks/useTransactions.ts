import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/axios';
import { Transaction, TransactionsParams, TransactionsResponse } from '@/types';

const fetchTransactions = async (url: string): Promise<TransactionsResponse> => {
  const response = await apiClient.get<{ success: boolean; data: Transaction[]; pagination: TransactionsResponse['pagination'] }>(url);
  return {
    data: response.data.data || [],
    pagination: response.data.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  };
};

export const useTransactions = (params?: TransactionsParams) => {
  const { data: session } = useSession();
  
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
  
  const { data, isLoading, mutate, error } = useSWR<TransactionsResponse>(
    (session as { accessToken?: string })?.accessToken && url ? url : null,
    fetchTransactions,
    { revalidateOnFocus: true }
  );

  return { 
    transactions: data?.data || [], 
    pagination: data?.pagination,
    isLoading, 
    mutate, 
    error 
  };
};

export const useTransactionById = (transactionId: string | null) => {
  const { data: session } = useSession();
  
  const { data, isLoading, mutate, error } = useSWR<Transaction | undefined>(
    (session as { accessToken?: string })?.accessToken && transactionId ? `transaction-${transactionId}` : null,
    async () => {
      const response = await apiClient.get<{ success: boolean; data: Transaction }>(`/api/transactions/${transactionId}`);
      return response.data.data;
    },
    { revalidateOnFocus: false }
  );

  return { 
    transaction: data, 
    isLoading, 
    mutate, 
    error 
  };
};

