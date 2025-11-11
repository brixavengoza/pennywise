import { GoalStatus } from './index';

export interface CreateGoalData {
  title: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: GoalStatus;
  currentAmount?: number;
}

