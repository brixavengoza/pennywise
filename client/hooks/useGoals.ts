import useSWR from 'swr';
import { apiClient } from '@/lib/axios';
import { Goal, GoalStatus } from '@/types';
import { CreateGoalData, UpdateGoalData } from '@/types/goals';

export const useGoals = (status?: GoalStatus) => {
  const { data, error, isLoading, mutate } = useSWR<Goal[]>(
    `goals-${status || 'all'}`,
    async () => {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      const endpoint = `/api/goals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<{ success: boolean; data: Goal[] }>(endpoint);
      return response.data.data;
    }
  );

  return {
    goals: data || [],
    isLoading,
    error,
    mutate,
  };
};

export const createGoal = async (data: CreateGoalData): Promise<Goal> => {
  const response = await apiClient.post('/api/goals', data);
  return response.data.data;
};

export const updateGoal = async (id: string, data: UpdateGoalData): Promise<Goal> => {
  const response = await apiClient.put(`/api/goals/${id}`, data);
  return response.data.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  await apiClient.delete<{ success: boolean; message?: string }>(`/api/goals/${id}`);
};

